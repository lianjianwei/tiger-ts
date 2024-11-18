import { EnumFactoryBase, IParser, Value } from '../../contract';
import { enum_ } from '../../model';

export class ValueParser implements IParser<Value[]> {

    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_Regex = /^([^*=<>!#-]+)\*(-?[0-9.]+)$/
    ) { }

    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data != 'string')
            throw new Error('ValueParser 解析异常, 无效的数据类型: ' + data);

        const lines = data.split("\n");
        const values: Value[] = [];
        const textOfValueType = this.m_EnumFactory.build(enum_.ValueTypeData).getReduce(enum_.TextOfValueType);
        for (const line of lines) {
            if (!line)
                continue;

            const matchRes = line.trim().match(this.m_Regex);
            if (!matchRes)
                throw new Error('ValueParser 解析异常, 无效的数据格式: ' + line);

            const [_, text, num] = matchRes;
            if (text == null || num == null)
                throw new Error('ValueParser 解析异常, 无效的数据格式: ' + line);

            if (!textOfValueType[text])
                throw new Error('ValueParser 解析异常, 无效的数值: ' + text);

            values.push({
                valueType: textOfValueType[text].value,
                count: Number(num)
            });
        }
        return values;
    }
}
