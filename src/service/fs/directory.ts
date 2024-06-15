import fs from 'fs';
import { basename, join } from 'path';

import { FsFile } from './file';
import { IDirectory } from '../../contract';

export class FsDirectory implements IDirectory {
    public name: string;

    public constructor(
        public path: string
    ) {
        this.name = basename(path);
    }

    public async exists() {
        return fs.existsSync(this.path);
    }

    public async findDirs() {
        return fs.readdirSync(this.path).filter(r => {
            const stat = fs.statSync(join(this.path, r));
            return stat.isDirectory();
        }).map(r => new FsDirectory(join(this.path, r)));
    }

    public async findFiles() {
        return fs.readdirSync(this.path).filter(r => {
            const stat = fs.statSync(join(this.path, r));
            return stat.isFile();
        }).map(r => new FsFile(join(this.path, r)));
    }

    public async remove() {
        fs.unlinkSync(this.path);
    }
}