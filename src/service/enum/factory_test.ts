import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { Enum as Self } from './factory';
import { Mock } from '../mock';
import { EnumItem, MemoryCacheBase } from '../../contract';

class TestData extends EnumItem {
    public static ctor = 'TestData';
}

class TextTest {
    public static ctor = 'TextTest';

    [text: string]: TestData;
}

describe('src/service/enum/factory.ts', () => {
    describe('.getReduce<TReduce>(reduceTyper: Type<TReduce>)', () => {
        it('ok', async () => {
            const mockMemoryCache = new Mock<MemoryCacheBase>();
            const self = new Self(mockMemoryCache.actual, TestData, {
                [TextTest.ctor]: (memo: TextTest, r) => {
                    memo[r.text] = r;
                    return memo;
                }
            });
            mockMemoryCache.exceptReturn(
                r => r.get(TestData),
                {
                    1: {
                        value: 1,
                        text: 'value1'
                    },
                    2: {
                        value: 2,
                        text: 'value2'
                    }
                }
            );
            const res = self.getReduce(TextTest);
            deepStrictEqual(res, {
                'value1': {
                    value: 1,
                    text: 'value1'
                },
                'value2': {
                    value: 2,
                    text: 'value2'
                }
            });
        });
    });
});
