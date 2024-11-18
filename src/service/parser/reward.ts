import { EnumFactoryBase, IParser, Reward } from '../../contract';
import { enum_ } from '../../model';

export class RewardParser implements IParser<Reward[][]> {

    public constructor(
        private m_EnumFactory: EnumFactoryBase,
        private m_Regex = /^([^*=<>!#-]+)\*(-?[0-9.]+)\*(\d+)$/
    ) { }

    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data != 'string')
            throw new Error('RewardParser 解析异常, 无效的数据类型: ' + data);

        const lines = data.split("\n");
        const result: Reward[][] = [];
        let rewards: Reward[] = [];
        const textOfValueType = this.m_EnumFactory.build(enum_.ValueTypeData).getReduce(enum_.TextOfValueType);
        for (const line of lines) {
            if (!line) {
                if (rewards.length)
                    result.push(rewards);

                rewards = [];
                continue;
            }

            const matchRes = line.trim().match(this.m_Regex);
            if (!matchRes)
                throw new Error('RewardParser 解析异常, 无效的数据格式: ' + line);

            const [_, text, num, weight] = matchRes;
            if (text == null || num == null || weight == null)
                throw new Error('RewardParser 解析异常, 无效的数据格式: ' + line);

            if (!textOfValueType[text])
                throw new Error('RewardParser 解析异常, 无效的数值: ' + text);

            rewards.push({
                valueType: textOfValueType[text].value,
                count: Number(num),
                weight: Number(weight)
            });
        }
        if (rewards.length)
            result.push(rewards);

        return result;
    }
}
