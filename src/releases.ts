import { CliUx } from '@oclif/core';
import { Client, ReleaseConfig, ReleaseMeta } from "@valist/sdk";
import { PlatformsMetaInterface } from '@valist/sdk/dist/typesShared';
import fs from 'fs';
import path from 'path';
import { zipDirectory } from './zip';

export async function uploadRelease(valist: Client, config: ReleaseConfig) {
  const platformEntries = Object.entries(config.platforms).filter(([_key, value]) => value !== "");

  const updatedPlatformEntries = await Promise.all(platformEntries.map(async ([platform, filePath]) => {
    const zipPath = `./${path.basename(filePath)}.zip`;
    await zipDirectory(filePath, zipPath);
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

  meta.external_url = await valist.writeFolder(
    platformIC,
    true,
    (bytes: string | number) => {
      CliUx.ux.log(`Uploading ${bytes}`);
    },
  );

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
