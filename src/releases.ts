import { CliUx } from '@oclif/core';
import { Client, ReleaseConfig, ReleaseMeta } from "@valist/sdk";
import { PlatformsMetaInterface } from '@valist/sdk/dist/typesShared';
import fs from 'fs';
import path from 'path';

export async function uploadRelease(valist: Client, config: ReleaseConfig) {
  const platformEntries = Object.entries(config.platforms).filter(([_key, value]) => value !== "");

  const meta: ReleaseMeta = {
    _metadata_version: "2",
    path: `${config.account}/${config.project}/${config.release}`,
    name: config.release,
    description: config.description || "",
    external_url: "",
    platforms: {},
  };

  const platformIC = platformEntries.map(([platformName, filePath]) => {
    const content = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);
    return {
      path: `${platformName}/${fileName}`,
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

  for (const [platformName, filePath] of platformEntries) {
    const fileName = path.basename(filePath);
    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;

    meta.platforms[platformName as keyof PlatformsMetaInterface] = {
      name: fileName,
      external_url: `${meta.external_url}/${platformName}/${fileName}`,
      downloadSize: fileSize.toString(),
      installSize: fileSize.toString(),
    };
  }
  return meta;
}
