import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { CacheConfigLoader as Self } from './config-loader';
import { Mock, mockAny } from '../mock';
import { CacheBase } from '../../contract';

class TestConfig {
    public static ctor = 'TestConfig';
}

describe('src/service/cache/config-loader.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const mockCache = new Mock<CacheBase>();
            const self = new Self(mockCache.actual, null);
            mockCache.exceptReturn(
                r => r.get('Config:TestConfig', mockAny),
                {}
            );
            const res = await self.load(TestConfig);
            deepStrictEqual(res, {});
        });
    });
});
