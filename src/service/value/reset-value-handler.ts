import dayjs from 'dayjs';

import { EnumFactoryBase, ValueHandlerBase, ValueHandlerContext } from '../../contract';
import { enum_ } from '../../model';

/**
 * 重置值处理器
 * 
 * 需要配置 ValueTypeData.reset 
 * 1. 配置 timeValueType 为时间值类型，用于记录上次更新时间
 * 2. 配置 countValueType 为数值值类型，用于记录当前值
 * 3. 配置 fixed 为固定值，用于重置时设置当前值
 * 
 * 2和3选配一个即可，都配置时，优先使用 countValueType 
 */
export class ResetValueHandler extends ValueHandlerBase {
    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_SrvNo: number
    ) {
        super();
    }

    public async getCountHandle(ctx: ValueHandlerContext) {
        const allItem = await this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo: this.m_SrvNo,
        }).allItem;
        const reset = allItem[ctx.value.valueType]?.reset;
        if (reset) {
            const isReset = await this.isReset(reset, ctx);
            if (isReset) {
                if (reset.countValueType) {
                    const count = await ctx.valueService.getCount(reset.countValueType);
                    ctx.value.count = count;
                } else {
                    ctx.value.count = reset.fixed ?? 0;
                }
            }
        }

        await this.next?.getCountHandle(ctx);
    }

    public async updateHandle(ctx: ValueHandlerContext) {
        const allItem = await this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo: this.m_SrvNo,
        }).allItem;
        const reset = allItem[ctx.value.valueType]?.reset;
        if (reset) {
            const isReset = await this.isReset(reset, ctx);
            if (isReset) {
                const timeOffset = ctx.valueService.ownValue[enum_.ValueType.timeOffset] || 0;
                const now = timeOffset + dayjs().unix();
                await ctx.valueService.updateOne({
                    valueType: reset.timeValueType,
                    count: now
                });
                if (reset.countValueType) {
                    ctx.valueService.ownValue[ctx.value.valueType] = await ctx.valueService.getCount(reset.countValueType);
                } else {
                    ctx.valueService.ownValue[ctx.value.valueType] = reset.fixed ?? 0;
                }
            }
        }
        
        await this.next?.updateHandle(ctx);
    }

    private async isReset(reset: enum_.ValueTypeDataReset, ctx: ValueHandlerContext) {
        const updateTime = await ctx.valueService.getCount(reset.timeValueType);
        const timeOffset = ctx.valueService.ownValue[enum_.ValueType.timeOffset] || 0;
        const now = timeOffset + dayjs().unix();
        return !dayjs.unix(now).isSame(dayjs.unix(updateTime), reset.timeGranularity);
    }
}
