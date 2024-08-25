import { strictEqual } from 'assert';

import { MemoryCache as Self } from './cache';

describe('src/service/memory/cache.ts', () => {
    describe('.get<T>(key: MemoryCacheKey): T', () => {
        it('ok', () => {
            const self = new Self();
            const key = 'test-key';
            self.set(key, 123);
            const res = self.get<number>(key);
            strictEqual(res, 123);
        });
    });

    describe('.del(key: MemoryCacheKey)', () => {
        it('ok', async () => {
            const self = new Self();
            const key = 'test-key';
            self.set(key, 123);
            const res1 = self.get<number>(key);
            strictEqual(res1, 123);
            self.del(key);
            const res2 = self.get<number>(key);
            strictEqual(res2, undefined);
        });
    });
});
