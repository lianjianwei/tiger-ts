import { ValueHandlerBase, ValueHandlerContext } from '../../contract';

/**
 * 默认的数值处理器，会把数值累加到对应的 ownValue[valueType] 上
 * 
 * 示例
 * ```typescript
 * const ownValue = {};
 * const valueHandler = new DefaultValueHandler();
 * const valueService = new ValueService(ownValue, valueHandler);
 * await valueService.update([ { count: 2, valueType: 1 } ]);
 * console.log(ownValue); // { 1: 2 }
 * ```
 */
export class DefaultValueHandler extends ValueHandlerBase {
    public async updateHandle(ctx: ValueHandlerContext) {
        ctx.valueService.ownValue[ctx.value.valueType] ??= 0;
        ctx.valueService.ownValue[ctx.value.valueType] += ctx.value.count;

        this.next?.updateHandle(ctx);
    }
}
