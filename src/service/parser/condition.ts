import { Condition, EnumFactoryBase, IParser } from '../../contract';
import { enum_ } from '../../model';

export class ConditionParser implements IParser<Condition[][]> {

    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_Regex = /^([^*#=<>!-]+)([<>=!]+)(-?[0-9.]+)$/
    ) { }

    public parse(data: any, srvNo: number) {
        if (data == null)
            return null;

        if (typeof data != 'string')
            throw new Error('ConditionParser 解析异常, 无效的数据类型: ' + data);

        const lines = data.split("\n");
        const results: Condition[][] = [];
        let conditions: Condition[] = [];
        const textOfValueType = this.m_EnumFactory.build({
            typer: enum_.ValueTypeData,
            srvNo
        }).getReduce(enum_.TextOfValueType);
        for (const line of lines) {
            if (!line) {
                if (conditions.length)
                    results.push(conditions);

                conditions = [];
                continue;
            }

            const matchRes = line.trim().match(this.m_Regex);
            if (!matchRes)
                throw new Error('ConditionParser 解析异常, 无效的数据格式: ' + line);

            const [_, text, op, num] = matchRes;
            if (text == null || op == null || num == null)
                throw new Error('ConditionParser 解析异常, 无效的数据格式: ' + line);

            if (!textOfValueType[text])
                throw new Error('ConditionParser 解析异常, 无效的数值: ' + text);

            conditions.push({
                valueType: textOfValueType[text].value,
                count: Number(num),
                op: op as any
            });
        }
        if (conditions.length)
            results.push(conditions);

        return results;
    }
}
