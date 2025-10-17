import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { RewardParser as Self } from './reward';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/parser/reward.ts', () => {
    describe('.parse(data: any)', () => {
        it('ok', async () => {
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

            const res = self.parse("银两*10*100\n等级*10*50\n\n\n银两*-500*100");
            deepStrictEqual(res, [
                [
                    { valueType: 1002, count: 10, weight: 100 },
                    { valueType: 1001, count: 10, weight: 50 },
                ],
                [
                    { valueType: 1002, count: -500, weight: 100 },
                ]
            ]);
        });
    });
});
