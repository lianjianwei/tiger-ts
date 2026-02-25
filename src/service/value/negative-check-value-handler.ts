import { EnumFactoryBase, ValueHandlerBase, ValueHandlerContext } from '../../contract';
import { enum_ } from '../../model';

/**
 * 负数检查处理器
 * 
 * 需要配置 ValueTypeData.isNegative
 */
export class NegativeCheckValueHandler extends ValueHandlerBase {
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
        const isNegative = allItem[ctx.value.valueType]?.isNegative;
        if (!isNegative) {
            const count = ctx.valueService.ownValue[ctx.value.valueType] ?? 0;
            if (count < 0) {
                throw new Error(`[${ctx.value.valueType}] 不能为负数`);
            }
        }

        await this.next?.updateHandle(ctx);
    }
}
