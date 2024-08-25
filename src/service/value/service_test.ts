import { strictEqual } from 'assert';

import { ValueService as Self } from './service';
import { Mock } from '../mock';
import { ValueHandlerBase } from '../../contract';

describe('src/service/value/service.ts', () => {
    describe('.getCount(uow: IUnitOfWork, valueType: number)', () => {
        it('ok', () => {
            const self = new Self({
                1: 100
            }, null);
            const count = self.getCount(1);
            strictEqual(count, 100);
        });
    });

    describe('.update(uow: IUnitOfWork, values: Value[])', () => {
        it('ok', () => {
            const mockValueHandler = new Mock<ValueHandlerBase>();
            const self = new Self({}, mockValueHandler.actual);
            mockValueHandler.except.updateHandle({
                value: {
                    count: 100,
                    valueType: 1
                },
                valueService: self
            });
            self.update([
                {
                    count: 100,
                    valueType: 1
                }
            ]);
        });
    });

    describe('.checkCondition(uow: IUnitOfWork, conditions: Condition[][])', () => {
        it('default return true', () => {
            const self = new Self({}, null);
            const res1 = self.checkCondition(null);
            strictEqual(res1, true);

            const res2 = self.checkCondition([]);
            strictEqual(res2, true);

            const res3 = self.checkCondition([[]]);
            strictEqual(res3, true);
        });

        it('= is ok', () => {
            const self = new Self({
                1: 100,
                2: 200
            }, null);
            const res1 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '='
                    }
                ]
            ]);
            strictEqual(res1, true);

            const res2 = self.checkCondition([
                [
                    {
                        count: 0,
                        valueType: 1,
                        op: '='
                    }
                ],
                [
                    {
                        count: 200,
                        valueType: 2,
                        op: '='
                    }
                ]
            ]);
            strictEqual(res2, true);


            const res3 = self.checkCondition([
                [
                    {
                        count: 0,
                        valueType: 1,
                        op: '='
                    },
                    {
                        count: 200,
                        valueType: 2,
                        op: '='
                    }
                ]
            ]);
            strictEqual(res3, false);
        });

        it('> is ok', () => {
            const self = new Self({
                1: 100,
                2: 200
            }, null);
            const res1 = self.checkCondition([
                [
                    {
                        count: 50,
                        valueType: 1,
                        op: '>'
                    }
                ]
            ]);
            strictEqual(res1, true);

            const res2 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '>'
                    }
                ],
                [
                    {
                        count: 100,
                        valueType: 2,
                        op: '>'
                    }
                ]
            ]);
            strictEqual(res2, true);

            const res3 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '>'
                    },
                    {
                        count: 100,
                        valueType: 2,
                        op: '>'
                    }
                ]
            ]);
            strictEqual(res3, false);
        });


        it('>= is ok', () => {
            const self = new Self({
                1: 100,
                2: 200
            }, null);
            const res1 = self.checkCondition([
                [
                    {
                        count: 50,
                        valueType: 1,
                        op: '>='
                    }
                ]
            ]);
            strictEqual(res1, true);

            const res2 = self.checkCondition([
                [
                    {
                        count: 101,
                        valueType: 1,
                        op: '>='
                    }
                ],
                [
                    {
                        count: 100,
                        valueType: 2,
                        op: '>='
                    }
                ]
            ]);
            strictEqual(res2, true);

            const res3 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '>='
                    },
                    {
                        count: 100,
                        valueType: 2,
                        op: '>='
                    }
                ]
            ]);
            strictEqual(res3, true);
        });

        it('< is ok', () => {
            const self = new Self({
                1: 100,
                2: 200
            }, null);
            const res1 = self.checkCondition([
                [
                    {
                        count: 150,
                        valueType: 1,
                        op: '<'
                    }
                ]
            ]);
            strictEqual(res1, true);

            const res2 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '<'
                    }
                ],
                [
                    {
                        count: 1000,
                        valueType: 2,
                        op: '<'
                    }
                ]
            ]);
            strictEqual(res2, true);

            const res3 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '<'
                    },
                    {
                        count: 100,
                        valueType: 2,
                        op: '<'
                    }
                ]
            ]);
            strictEqual(res3, false);
        });

        it('<= is ok', () => {
            const self = new Self({
                1: 100,
                2: 200
            }, null);
            const res1 = self.checkCondition([
                [
                    {
                        count: 150,
                        valueType: 1,
                        op: '<='
                    }
                ]
            ]);
            strictEqual(res1, true);

            const res2 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '<='
                    }
                ],
                [
                    {
                        count: 100,
                        valueType: 2,
                        op: '<='
                    }
                ]
            ]);
            strictEqual(res2, true);

            const res3 = self.checkCondition([
                [
                    {
                        count: 100,
                        valueType: 1,
                        op: '<='
                    },
                    {
                        count: 100,
                        valueType: 2,
                        op: '<='
                    }
                ]
            ]);
            strictEqual(res3, false);
        });
    });
});
