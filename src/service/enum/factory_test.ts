import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { Enum as Self } from './factory';
import { Mock } from '../mock';
import { EnumItem, IEnumLoadHandler } from '../../contract';

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
            const mockEnumLoadHandler = new Mock<IEnumLoadHandler>();
            const self = new Self(mockEnumLoadHandler.actual, TestData, {
                [TextTest.ctor]: (memo: TextTest, r) => {
                    memo[r.text] = r;
                    return memo;
                }
            });
            mockEnumLoadHandler.exceptReturn(
                r => r.load(TestData),
                {
                    cacheOn: 100,
                    allItem: {
                        1: {
                            value: 1,
                            text: 'value1'
                        },
                        2: {
                            value: 2,
                            text: 'value2'
                        }
                    }
                }
            );
            const res = await self.getReduce(TextTest);
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
