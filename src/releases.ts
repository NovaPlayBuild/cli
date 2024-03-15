import { CliUx } from '@oclif/core';
import { Client, ReleaseConfig, ReleaseMeta } from "@valist/sdk";
import { PlatformsMetaInterface } from '@valist/sdk/dist/typesShared';
import fs from 'fs';
import path from 'path';
import { zipDirectory } from './zip';
import { YamlConfig } from './types';
import { getZipName } from './utils/getZipName';

export async function uploadRelease(valist: Client, config: ReleaseConfig, yamlConfig?: YamlConfig) {
  /* eslint-disable-next-line */
  const platformEntries = Object.entries(config.platforms).filter(([_key, value]) => value !== "");

  const updatedPlatformEntries = await Promise.all(platformEntries.map(async ([platform, filePath]) => {
    if (yamlConfig && yamlConfig.platforms[platform] && !yamlConfig.platforms[platform].zip) {
      return [platform, filePath]
    }
    const zipPath = getZipName(filePath);
    CliUx.ux.action.start(`zipping ${zipPath}`);
    await zipDirectory(filePath, zipPath);
    CliUx.ux.action.stop();
    return [platform, zipPath] as [string, string];
  }));

  const meta: ReleaseMeta = {
    _metadata_version: "2",
    path: `${config.account}/${config.project}/${config.release}`,
    name: config.release,
    description: config.description || "",
    external_url: "",
    platforms: {},
  };

  const platformIC = updatedPlatformEntries.map(([platformName, zipPath]) => {
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

  for (const [platformName, zipPath] of updatedPlatformEntries) {
    const stats = await fs.promises.stat(zipPath);
    const fileSize = stats.size;

    meta.platforms[platformName as keyof PlatformsMetaInterface] = {
      name: path.basename(zipPath),
      external_url: `${meta.external_url}/${platformName}/${path.basename(zipPath)}`,
      downloadSize: fileSize.toString(),
      installSize: fileSize.toString(), // Adjust this if necessary
    };
  }
  return meta;
}
