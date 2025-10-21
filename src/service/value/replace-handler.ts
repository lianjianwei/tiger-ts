import { EnumFactoryBase, ValueHandlerBase, ValueHandlerContext } from '../../contract';
import { enum_ } from '../../model';

/**
 * 覆盖的数值处理器，如果数值具备 isReplace 属性，那么会把数值 ownValue[valueType] 置为 0
 * 
 * 示例
 * ```typescript
 * const ownValue = {};
 * const valueHandler = new ReplaceValueHandler();
 * const valueService = new ValueService(ownValue, valueHandler);
 * await valueService.update([ { count: 2, valueType: 1 } ]);
 * console.log(ownValue); // { 1: 0 }
 * ```
 */
export class ReplaceValueHandler extends ValueHandlerBase {

    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_SrvNo: number
    ) {
        super();
    }

    public async updateHandle(ctx: ValueHandlerContext) {
        const allItem = await this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo: this.m_SrvNo
        }).allItem;
        if (allItem[ctx.value.valueType]?.isReplace)
            ctx.valueService.ownValue[ctx.value.valueType] = 0;

        await this.next?.updateHandle(ctx);
    }
}
