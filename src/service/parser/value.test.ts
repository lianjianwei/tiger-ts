import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { ValueParser as Self } from './value';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/parser/value.ts', () => {
    describe('.parse(data: any)', () => {
        it('ok', async () => {
            const mockEnumFactory = new Mock<EnumFactoryBase>;
            const self = new Self(mockEnumFactory.actual);

            const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>();
            mockEnumFactory.exceptReturn(
                r => r.build({
                    typer: enum_.ValueTypeData,
                    srvNo: 0
                }),
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

            const res = self.parse("银两*10\n\n\n银两*-500", 0);
            deepStrictEqual(res, [
                { valueType: 1002, count: 10 },
                { valueType: 1002, count: -500 },
            ]);
        });
    });
});
