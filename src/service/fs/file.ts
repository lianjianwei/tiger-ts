import fs from 'fs';
import { extname, basename } from 'path';

import { IFile } from '../../contract';

export class FsFile implements IFile {
    public ext: string;
    public name: string;

    public constructor(
        public path: string
    ) {
        this.name = basename(path);
        this.ext = extname(path);
    }

    public async exists() {
        return fs.existsSync(this.path);
    }

    public async read() {
        return fs.readFileSync(this.path, { encoding: 'utf-8' });
    }

    public async readJson<T>() {
        const str = await this.read();
        return JSON.parse(str) as T;
    }

    public async remove() {
        fs.unlinkSync(this.path);
    }
}
