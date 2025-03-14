import { strictEqual } from 'assert';

import { FilterValueHandler as Self } from './filter-handler';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum, IValueService } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/value/filter-handler.ts', () => {
    describe('.updateHandle(ctx: ValueHandlerContext)', () => {
        it('ok', async () => {
            const mockEnumFactory = new Mock<EnumFactoryBase>();
            const self = new Self(mockEnumFactory.actual);

            const ownValue = {
                1: 2
            };
            const mockValueService = new Mock<IValueService>({
                ownValue: ownValue
            });

            const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>({
                allItem: {
                    1: {
                        value: 1,
                        isReplace: true
                    }
                }
            });
            mockEnumFactory.exceptReturn(
                r => r.build(enum_.ValueTypeData),
                mockEnum.actual
            );

            await self.updateHandle({
                value: {
                    valueType: 1,
                    count: 2
                },
                valueService: mockValueService.actual
            });
            strictEqual(ownValue[1], 2);
        });
    });
});
