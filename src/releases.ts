import { CliUx } from '@oclif/core';
import { Client, ReleaseMeta } from "@valist/sdk";
import { PlatformsMetaInterface } from '@valist/sdk/dist/typesShared';
import fs from 'fs';
import path from 'path';
import { zipDirectory } from './zip';
import { ReleaseConfig } from './types';
import { getZipName } from './utils/getZipName';

interface PlatformEntry {
  platform: string
  path: string
  installScript: string
  executable: string
}

export async function uploadRelease(valist: Client, config: ReleaseConfig) {
  const updatedPlatformEntries: PlatformEntry[] = await Promise.all(Object.entries(config.platforms).map(async ([platform, platformConfig]) => {
    const installScript = platformConfig.installScript;
    const executable = platformConfig.executable;
    if (config && config.platforms[platform] && !config.platforms[platform].zip) {
      return {platform, path: platformConfig.path, installScript, executable}
    }
    const zipPath = getZipName(platformConfig.path);
    CliUx.ux.action.start(`zipping ${zipPath}`);
    await zipDirectory(platformConfig.path, zipPath);
    CliUx.ux.action.stop();
    return {platform, path: zipPath, installScript, executable};
  }));

  const meta: ReleaseMeta = {
    _metadata_version: "2",
    path: `${config.account}/${config.project}/${config.release}`,
    name: config.release,
    description: config.description || "",
    external_url: "",
    platforms: {},
  };

  const platformIC = updatedPlatformEntries.map(({platform: platformName, path: zipPath}) => {
    const content = fs.createReadStream(zipPath);
    return {
      path: `${platformName}/${path.basename(zipPath)}`,
      content,
    };
  });

  CliUx.ux.action.start('uploading files');
  meta.external_url = await valist.writeFolder(
    platformIC,
    true,
    (bytes: string | number) => {
      CliUx.ux.log(`Uploading ${bytes}`);
    },
  );
  CliUx.ux.action.stop();

  for (const {platform: platformName, path: zipPath, installScript, executable} of updatedPlatformEntries) {
    const stats = await fs.promises.stat(zipPath);
    const fileSize = stats.size;

    meta.platforms[platformName as keyof PlatformsMetaInterface] = {
      name: path.basename(zipPath),
      external_url: `${meta.external_url}/${platformName}/${path.basename(zipPath)}`,
      downloadSize: fileSize.toString(),
      installSize: fileSize.toString(), // Adjust this if necessary
      installScript,
      executable,
    };
  }
  return meta;
}
