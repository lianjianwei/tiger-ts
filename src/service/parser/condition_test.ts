import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { ConditionParser as Self } from './condition';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/parser/condition.ts', () => {
    describe('.parse(data: any)', () => {
        it('并且条件', async () => {
            const mockEnumFactory = new Mock<EnumFactoryBase>;
            const self = new Self(mockEnumFactory.actual);

            const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>();
            mockEnumFactory.exceptReturn(
                r => r.build(enum_.ValueTypeData),
                mockEnum.actual
            );

            mockEnum.exceptReturn(
                r => r.getReduce(enum_.TextOfValueType),
                {
                    "等级": {
                        "value": 1001
                    },
                    "银两": {
                        "value": 1002
                    }
                }
            );

            const res = self.parse("银两=10\n等级>=10");
            deepStrictEqual(res, [[
                { valueType: 1002, count: 10, op: '=' },
                { valueType: 1001, count: 10, op: '>=' },
            ]]);
        });

        it('或者+并且条件', async () => {
            const mockEnumFactory = new Mock<EnumFactoryBase>;
            const self = new Self(mockEnumFactory.actual);

            const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>();
            mockEnumFactory.exceptReturn(
                r => r.build(enum_.ValueTypeData),
                mockEnum.actual
            );

            mockEnum.exceptReturn(
                r => r.getReduce(enum_.TextOfValueType),
                {
                    "等级": {
                        "value": 1001
                    },
                    "银两": {
                        "value": 1002
                    }
                }
            );

            const res = self.parse("银两!=50\n\n\n\n等级<=20\n银两>=6000");
            deepStrictEqual(res, [
                [{ valueType: 1002, count: 50, op: '!=' }],
                [
                    { valueType: 1001, count: 20, op: '<=' },
                    { valueType: 1002, count: 6000, op: '>=' }
                ],
            ]);
        });
    });
});
