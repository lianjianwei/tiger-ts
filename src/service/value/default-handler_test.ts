import { strictEqual } from 'assert';

import { DefaultValueHandler as Self } from './default-handler';
import { Mock } from '../mock';
import { IValueService } from '../../contract';

describe('src/service/value/default-handler.ts', () => {
    describe('.updateHandle(ctx: ValueHandlerContext)', () => {
        it('ok', () => {
            const self = new Self();

            const ownValue = {
                1: 2
            };
            const mockValueService = new Mock<IValueService>({
                ownValue: ownValue
            });

            self.updateHandle({
                value: {
                    valueType: 1,
                    count: 8
                },
                valueService: mockValueService.actual
            });
            strictEqual(ownValue[1], 10);
        });
    });
});
