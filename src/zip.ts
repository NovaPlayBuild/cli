import fs from 'fs';
import archiver from 'archiver';

export function zipDirectory(sourceDir: string, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
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
      reject(err);
    });
    archive.pipe(output);

    // Append files from the source directory, preserving directory structure.
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}