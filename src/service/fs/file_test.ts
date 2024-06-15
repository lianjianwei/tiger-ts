import 'reflect-metadata';

import { notStrictEqual, strictEqual } from 'assert';
import path from 'path';

import { FsFile as Self } from './file';

describe('src/service/fs/file.ts', () => {
    describe('.exists()', () => {
        it('file exists', async () => {
            const self = new Self(path.join(__dirname, 'file.ts'));
            const res = await self.exists();
            strictEqual(res, true);
        });

        it('file not exists', async () => {
            const self = new Self(path.join(__dirname, 'file-not-exists.ts'));
            const res = await self.exists();
            strictEqual(res, false);
        });
    });

    describe('.read()', () => {
        it('read exists', async () => {
            const self = new Self(__filename);
            const res = await self.read();
            strictEqual(res.startsWith('import'), true);
        });

        it('read not exists', async () => {
            const self = new Self(path.join(__dirname, 'file-not-exists.ts'));
            let error: any = null;
            try {
                await self.read();
            } catch (ex) {
                error = ex;
            }
            notStrictEqual(error, null);
        });
    });

    describe('.readJson()', () => {
        it('read json', async () => {
            const self = new Self(path.join(process.cwd(), 'package.json'));
            const res = await self.readJson<{ name: string; }>();
            strictEqual(res.name, 'tiger-ts');
        });
    });
});
