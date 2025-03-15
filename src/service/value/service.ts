import { Condition, IValueService, OwnValue, Value, ValueHandlerBase } from '../../contract';

export class ValueService implements IValueService {

    public constructor(
        public ownValue: OwnValue,
        private m_ValueHandler?: ValueHandlerBase
    ) { }

    public async checkCondition(conditions: Condition[][]) {
        if (!conditions || !conditions.length)
            return true;

        const allPromises = conditions.map(async r => {
            const promises = r.map(async cr => {
                const count = await this.getCount(cr.valueType);
                switch (cr.op) {
                    case '>':
                        return count > cr.count;
                    case '>=':
                        return count >= cr.count;
                    case '<':
                        return count < cr.count;
                    case '<=':
                        return count <= cr.count;
                    case '!=':
                        return count != cr.count;
                    default:
                        return count == cr.count;
                }
            });
            const res = await Promise.all(promises);
            return res.every(cr => cr);
        });
        const results = await Promise.all(allPromises);
        return results.some(r => r);
    }

    public async checkEnough(values: Value[]) {
        values ??= [];
        let item: Value;
        let oldCount: number;
        for (const r of values) {
            if (r.count >= 0)
                continue;

            const count = await this.getCount(r.valueType);
            if (count < -r.count) {
                item = r;
                oldCount = count;
                break;
            }
        }
        if (item) {
            return {
                enough: false,
                value: {
                    valueType: item.valueType,
                    count: oldCount + item.count
                }
            };
        }
        return {
            enough: true
        };
    }

    public async getCount(valueType: number) {
        valueType = Number(valueType);
        if (isNaN(valueType))
            throw new Error(`无效的 valueType: [${valueType}]`);

        const value: Value = {
            valueType: valueType,
            count: this.ownValue[valueType] ?? 0
        };

        await this.m_ValueHandler?.getCountHandle({
            value: value,
            valueService: this
        });

        return value.count;
    }

    public async update(values: Value[]) {
        for (const r of values ?? []) {
            r.count = Number(r.count);
            r.valueType = Number(r.valueType);
            if (isNaN(r.count))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);
            if (isNaN(r.valueType))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);

            await this.m_ValueHandler?.updateHandle({
                value: r,
                valueService: this
            });
        }
    }
}
