import { strictEqual } from 'assert';

import dayjs from 'dayjs';

import { ResetValueHandler as Self } from './reset-value-handler';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum, IValueService } from '../../contract';
import { enum_ } from '../../model';

const NOW = dayjs().unix();
const PAST = dayjs().subtract(1, 'day').unix();

function buildEnumFactory(reset?: enum_.ValueTypeDataReset) {
    const mockEnumFactory = new Mock<EnumFactoryBase>();
    const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>({
        allItem: Promise.resolve({
            1: {
                value: 1,
                isReplace: false,
                reset
            } as enum_.ValueTypeData
        })
    });
    mockEnumFactory.exceptReturn(
        r => r.build({ typer: enum_.ValueTypeData, srvNo: 0 }),
        mockEnum.actual
    );
    return mockEnumFactory;
}

describe('src/service/value/reset-value-handler.ts', () => {
    describe('.getCountHandle(ctx: ValueHandlerContext)', () => {
        it('无 reset 配置时，不修改 count，调用 next', async () => {
            const mockEnumFactory = buildEnumFactory(undefined);
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };

            await self.getCountHandle(ctx);
            strictEqual(ctx.value.count, 10);
        });

        it('有 reset 配置，未到重置时间（同一天），不修改 count', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 5
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            mockValueService.exceptReturn(r => r.getCount(100), NOW);

            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };
            await self.getCountHandle(ctx);
            strictEqual(ctx.value.count, 10);
        });

        it('有 reset 配置，已到重置时间，使用 fixed 重置 count', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 5
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);

            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };
            await self.getCountHandle(ctx);
            strictEqual(ctx.value.count, 5);
        });

        it('有 reset 配置，已到重置时间，无 fixed 时 count 重置为 0', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: undefined
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);

            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };
            await self.getCountHandle(ctx);
            strictEqual(ctx.value.count, 0);
        });

        it('有 reset 配置，已到重置时间，使用 countValueType 获取 count', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 5,
                countValueType: 200
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);
            mockValueService.exceptReturn(r => r.getCount(200), 99);

            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };
            await self.getCountHandle(ctx);
            // countValueType 优先于 fixed
            strictEqual(ctx.value.count, 99);
        });

        it('timeOffset 参与 now 计算', async () => {
            // timeOffset 设为负的一天，使 now 看起来是昨天，和昨天的 updateTime 相同（同一天），不触发重置
            const oneDaySec = 86400;
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 5
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const ownValue = { [enum_.ValueType.timeOffset]: -oneDaySec };
            const mockValueService = new Mock<IValueService>({ ownValue });
            // updateTime 为昨天，timeOffset 把 now 也偏移到昨天 => isSame => 不重置
            mockValueService.exceptReturn(r => r.getCount(100), PAST);

            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };
            await self.getCountHandle(ctx);
            strictEqual(ctx.value.count, 10);
        });
    });

    describe('.updateHandle(ctx: ValueHandlerContext)', () => {
        it('无 reset 配置时，不调用 updateOne，调用 next', async () => {
            const mockEnumFactory = buildEnumFactory(undefined);
            const self = new Self(mockEnumFactory.actual, 0);

            const mockValueService = new Mock<IValueService>({ ownValue: {} });
            const ctx = { value: { valueType: 1, count: 10 }, valueService: mockValueService.actual };

            await self.updateHandle(ctx);
            // 无报错即通过（updateOne 未被注册，调用会抛错）
        });

        it('有 reset 配置，未到重置时间，不修改 ownValue，更新时间戳', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 5
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const ownValue: { [k: number]: number } = { 1: 10 };
            const mockValueService = new Mock<IValueService>({ ownValue });
            mockValueService.exceptReturn(r => r.getCount(100), NOW);
            mockValueService.exceptReturn(r => r.updateOne({ valueType: 100, count: NOW }), undefined);

            const ctx = { value: { valueType: 1, count: 0 }, valueService: mockValueService.actual };
            await self.updateHandle(ctx);
            strictEqual(ownValue[1], 10);
        });

        it('有 reset 配置，已到重置时间，使用 fixed 更新 ownValue，更新时间戳', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 7
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const ownValue: { [k: number]: number } = { 1: 10 };
            const mockValueService = new Mock<IValueService>({ ownValue });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);
            mockValueService.exceptReturn(r => r.updateOne({ valueType: 100, count: NOW }), undefined);

            const ctx = { value: { valueType: 1, count: 0 }, valueService: mockValueService.actual };
            await self.updateHandle(ctx);
            strictEqual(ownValue[1], 7);
        });

        it('有 reset 配置，已到重置时间，使用 countValueType 更新 ownValue', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: 7,
                countValueType: 200
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const ownValue: { [k: number]: number } = { 1: 10 };
            const mockValueService = new Mock<IValueService>({ ownValue });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);
            mockValueService.exceptReturn(r => r.getCount(200), 42);
            mockValueService.exceptReturn(r => r.updateOne({ valueType: 100, count: NOW }), undefined);

            const ctx = { value: { valueType: 1, count: 0 }, valueService: mockValueService.actual };
            await self.updateHandle(ctx);
            // countValueType 优先于 fixed
            strictEqual(ownValue[1], 42);
        });

        it('有 reset 配置，已到重置时间，无 fixed 时 ownValue 重置为 0', async () => {
            const mockEnumFactory = buildEnumFactory({
                timeValueType: 100,
                timeGranularity: 'day',
                fixed: undefined
            });
            const self = new Self(mockEnumFactory.actual, 0);

            const ownValue: { [k: number]: number } = { 1: 10 };
            const mockValueService = new Mock<IValueService>({ ownValue });
            mockValueService.exceptReturn(r => r.getCount(100), PAST);
            mockValueService.exceptReturn(r => r.updateOne({ valueType: 100, count: NOW }), undefined);

            const ctx = { value: { valueType: 1, count: 0 }, valueService: mockValueService.actual };
            await self.updateHandle(ctx);
            strictEqual(ownValue[1], 0);
        });
    });
});
