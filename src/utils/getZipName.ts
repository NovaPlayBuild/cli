import path from 'path';

export function getZipName(filePath: string){
    const zipName = path.basename(path.resolve(filePath), path.extname(filePath))
    return `./${zipName}.zip`;
}
