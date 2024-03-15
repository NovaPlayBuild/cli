import fs from 'fs';
import archiver from 'archiver';
import { CliUx } from '@oclif/core';

export function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('progress', (progress)=>{
      let progressString = `Zip Progress: Entries ${progress.entries.processed} out of ${progress.entries.total}.`;
      progressString += ` Bytes ${progress.fs.processedBytes} out of ${progress.fs.totalBytes}`;
      CliUx.ux.log(progressString);
    });

    output.on('close', function () {
      console.log(`Archive created successfully. Total bytes: ${archive.pointer()}`);
      resolve();
    });

    // Catch warnings (like stat failures and other non-blocking errors)
    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        console.warn(err);
      } else {
        reject(err);
      }
    });

    // Catch errors explicitly.
    archive.on('error', function (err) {
      CliUx.ux.error(err);
      reject(err);
    });
    archive.pipe(output);

    // Append files from the source directory, preserving directory structure.
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}