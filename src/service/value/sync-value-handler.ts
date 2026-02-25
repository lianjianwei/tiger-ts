import { EnumFactoryBase, ValueHandlerBase, ValueHandlerContext } from '../../contract';
import { enum_ } from '../../model';

/**
 * 同步值处理器
 * 
 * 需要配置 ValueTypeData.sync
 * 配置项：
 *  - valueTypes: 同步所有值（不管正数还是负数）
 *  - positiveValueTypes: 同步增加值类型
 *  - negativeValueTypes: 同步减少值类型
 */
export class SyncValueHandler extends ValueHandlerBase {
    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_SrvNo: number
    ) {
        super();
    }

    public async updateHandle(ctx: ValueHandlerContext) {
        const allItem = await this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo: this.m_SrvNo,
        }).allItem;
        const sync = allItem[ctx.value.valueType]?.sync;
        if (sync) {
            if (sync.valueTypes?.length) {
                const updateValues = sync.valueTypes.filter(r => r != ctx.value.valueType)
                    .map(r => {
                        return {
                            valueType: r,
                            count: ctx.value.count
                        };
                    })
                if (updateValues.length)
                    await ctx.valueService.update(updateValues);
            }

            if (ctx.value.count > 0) {
                const updateValues = (sync.positiveValueTypes || []).filter(r => r != ctx.value.valueType)
                    .map(r => {
                        return {
                            valueType: r,
                            count: ctx.value.count
                        };
                    })
                if (updateValues.length)
                    await ctx.valueService.update(updateValues);
            } else if (ctx.value.count < 0) {
                const updateValues = (sync.negativeValueTypes || []).filter(r => r != ctx.value.valueType)
                    .map(r => {
                        return {
                            valueType: r,
                            count: Math.abs(ctx.value.count)
                        };
                    })
                if (updateValues.length)
                    await ctx.valueService.update(updateValues);
            }
        }
        
        await this.next?.updateHandle(ctx);
    }
}
