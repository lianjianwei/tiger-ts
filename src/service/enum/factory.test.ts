import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { Enum as Self } from './factory';
import { EnumItem, Type } from '../../contract';

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
            const self = new Self(TestData, 0, async (_typer: Type<TestData> | string) => {
                return {
                    1: {
                        value: 1,
                        text: 'value1'
                    },
                    2: {
                        value: 2,
                        text: 'value2'
                    }
                };
            }, {
                [TextTest.ctor]: (memo: TextTest, r) => {
                    if (r.text)
                        memo[r.text] = r;
                    return memo;
                }
            });
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
