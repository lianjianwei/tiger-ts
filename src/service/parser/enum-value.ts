import { EnumFactoryBase, IParser } from '../../contract';
import { enum_ } from '../../model';

export class EnumValueParser implements IParser<number> {

    public constructor(
        private m_EnumFactory: EnumFactoryBase
    ) { }

    public parse(data: any, srvNo: number) {
        if (data == null)
            return null;

        if (typeof data != 'string')
            throw new Error('EnumValueParser 解析异常, 无效的数据格式: ' + data);

        const textOfValueType = this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo
        }).getReduce(enum_.TextOfValueType);
        if (!textOfValueType[data])
            throw new Error('ConditionParser 解析异常, 无效的数值: ' + data);

        return textOfValueType[data].value;
    }
}
