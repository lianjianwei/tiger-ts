import dayjs from 'dayjs';

import { EnumItem } from '../../contract';

export type ValueTypeDataReset = {
    // 时间数值
    timeValueType: number;
    // 重置时间粒度
    timeGranularity: dayjs.OpUnitType;
    // 重置为固定数值
    fixed: number;
    // 重置为指定数值类型的数值
    countValueType?: number;
};

export class ValueTypeData extends EnumItem {
    public static ctor = 'ValueTypeData';
    /**
     * 是否覆盖
     */
    public isReplace: boolean;
    /**
     * 重置配置
     */
    public reset?: ValueTypeDataReset;
    /**
     * 同步配置
     */
    public sync?: {
        // 负向同步
        negativeValueTypes: number[];
        // 正向同步
        positiveValueTypes: number[];
        // 全同步
        valueTypes: number[];
    };
    /**
     * 是否允许负数
     */
    public isNegative: boolean;
}

export class TextOfValueType {
    public static ctor = 'TextOfValueType';

    [text: string]: ValueTypeData;
}

export function textOfValueTypeReduce(memo: TextOfValueType, r: ValueTypeData) {
    memo[r.text] = r;
    return memo;
}
