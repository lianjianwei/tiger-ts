import 'reflect-metadata';

import { deepStrictEqual } from 'assert';

import { EnumValueParser as Self } from './enum-value';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/parser/enum-value.ts', () => {
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
                    "灵石": {
                        "value": 1002
                    }
                }
            );

            const res = self.parse("灵石", 0);
            deepStrictEqual(res, 1002);
        });
    });
});
