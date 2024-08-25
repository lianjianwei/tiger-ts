/**
 * 数值格式
 */
export type Value = {
    count: number;
    valueType: number;
};

/**
 * 条件格式
 */
export type Condition = Value & {
    op: '=' | '>' | '>=' | '<' | '<=';
};

export type OwnValue = {
    [valueType: number]: number;
};

export interface IValueService {
    /**
     * 源数据
     */
    readonly ownValue: OwnValue;
    /**
     * 检测条件是否满足，满足返回 true, 否则返回 false
     * 
     * @param conditions 条件：二维数组格式，不同数组之间为或者关系，同一个数组底下的为并且条件
     */
    checkCondition(conditions: Condition[][]): boolean;
    /**
     * 根据数值类型获取数据
     * 
     * @param valueType 数值类型
     */
    getCount(valueType: number): number;
    /**
     * 更新数据
     * 
     * @param values 数值
     */
    update(values: Value[]): void;
}

/**
 * 数值处理器上下文
 */
export type ValueHandlerContext = {
    value: Value;
    valueService: IValueService;
};

/**
 * 数值处理器
 */
export abstract class ValueHandlerBase {

    protected next: ValueHandlerBase;

    /**
     * 设置下一个处理器
     * 
     * @param next 下一个处理器
     * @returns 下一个处理器
     */
    public setNext(next: ValueHandlerBase) {
        this.next = next;
        return next;
    };

    /**
     * 获取数值处理器
     * 
     * @param _ctx 上下文
     */
    public getCountHandle(_ctx: ValueHandlerContext) { };

    /**
     * 更新处理器
     * 
     * @param _ctx 上下文
     */
    public updateHandle(_ctx: ValueHandlerContext) { };
}