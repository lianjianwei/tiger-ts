import { EnumFactoryBase, ValueHandlerBase, ValueHandlerContext } from '../../contract';
import { enum_ } from '../../model';

/**
 * 过滤的数值处理器
 * 
 * 如果数值具备 isReplace 属性，那么会判断更新的数值和现有的数值是否一致，一致则直接退出
 * 否则判断更新的数值是否为 0 ，为 0 则直接退出
 * 
 * 示例
 * ```typescript
 * const ownValue = { 1: 2 };
 * const uow: IUnitOfWork;
 * const valueHandler = new FilterValueHandler();
 * valueHandler.setNext(new DefaultValueHandler());
 * const valueService = new ValueService(ownValue, valueHandler);
 * await valueService.update(uow, [ { count: 0, valueType: 1 } ]); // 不会走到 DefaultValueHandler 的代码中
 * ```
 */
export class FilterValueHandler extends ValueHandlerBase {

    public constructor(
        private m_EnumFactory: EnumFactoryBase
    ) {
        super();
    }

    public async updateHandle(ctx: ValueHandlerContext) {
        const allItem = await this.m_EnumFactory.build(enum_.ValueTypeData).allItem;
        if (allItem[ctx.value.valueType]?.isReplace) {
            const oldCount = ctx.valueService.ownValue[ctx.value.valueType] ?? 0;
            if (oldCount == ctx.value.count)
                return;
        } else if (ctx.value.count == 0) {
            return;
        }

        await this.next?.updateHandle(ctx);
    }
}
