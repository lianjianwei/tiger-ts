import 'reflect-metadata';

import { strictEqual } from 'assert';
import path from 'path';

import { FsDirectory as Self } from './directory';

describe('src/service/fs/directory.ts', () => {
    describe('.exists()', () => {
        it('file exists', async () => {
            const self = new Self(path.join(__dirname));
            const res = await self.exists();
            strictEqual(res, true);
        });

        it('file not exists', async () => {
            const self = new Self(path.join(__dirname, 'dir-not-exists'));
            const res = await self.exists();
            strictEqual(res, false);
        });
    });

    describe('.findDirs()', () => {
        it('ok', async () => {
            const self = new Self(path.join(__dirname));
            const res = await self.findDirs();
            strictEqual(res.length == 0, true);
        });
    });

    describe('.findFiles()', () => {
        it('ok', async () => {
            const self = new Self(path.join(__dirname));
            const res = await self.findFiles();
            strictEqual(res.length > 0, true);
        });
    });
});
