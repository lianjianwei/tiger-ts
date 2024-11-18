import { EnumItem } from '../../contract';

export class ValueTypeData extends EnumItem {
    public static ctor = 'ValueTypeData';

    public isReplace: boolean;
}

export class TextOfValueType {
    public static ctor = 'TextOfValueType';

    [text: string]: ValueTypeData;
}

export function textOfValueTypeReduce(memo: TextOfValueType, r: ValueTypeData) {
    memo[r.text] = r;
    return memo;
}
