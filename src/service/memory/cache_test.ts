import { notStrictEqual, strictEqual } from 'assert';

import { MemoryCache as Self } from './cache';

describe('src/service/memory/cache.ts', () => {
    describe('.get<T>(key: string, fn: () => Promise<T> | T)', () => {
        it('ok', async () => {
            const self = new Self();
            const key = 'test-key';
            const res = await self.get(key, () => {
                return 10;
            });
            const cache = Reflect.get(self, 'm_Cache');
            strictEqual(res, 10);
            notStrictEqual(cache[key], undefined);
        });
    });

    describe('.flush(key: string)', () => {
        it('ok', async () => {
            const self = new Self();
            const key = 'test-key';
            await self.get(key, () => {
                return 10;
            });
            await self.flush(key);
            const cache = Reflect.get(self, 'm_Cache');
            strictEqual(cache[key], undefined);
        });
    });
});
