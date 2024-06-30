import { strictEqual } from 'assert';

import { ReplaceValueHandler as Self } from './replace-handler';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum, IValueService } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/value/replace-handler.ts', () => {
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
                allItem: Promise.resolve({
                    1: {
                        value: 1,
                        isReplace: true
                    }
                })
            });
            mockEnumFactory.exceptReturn(
                r => r.build(enum_.ValueTypeData),
                mockEnum.actual
            );

            await self.updateHandle({
                uow: null,
                value: {
                    valueType: 1,
                    count: 2
                },
                valueService: mockValueService.actual
            });
            strictEqual(ownValue[1], 0);
        });
    });
});
