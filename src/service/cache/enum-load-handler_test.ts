import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { CacheEnumLoadHandler as Self } from './enum-load-handler';
import { Mock, mockAny } from '../mock';
import { CacheBase, EnumItem } from '../../contract';

class TestData extends EnumItem {
    public static ctor = 'TestData';
}

describe('src/service/cache/enum-load-handler.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const mockCache = new Mock<CacheBase>();
            const self = new Self(mockCache.actual, null);
            mockCache.exceptReturn(
                r => r.get('Enum:TestData', mockAny),
                {}
            );
            mockCache.exceptReturn(
                r => r.getCacheOn('Enum:TestData'),
                1
            );
            const res = await self.load(TestData);
            deepStrictEqual(res, {
                cacheOn: 1,
                allItem: {}
            });
        });
    });
});
