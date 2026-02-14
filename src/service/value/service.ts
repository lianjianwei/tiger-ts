import { Condition, IValueService, OwnValue, Value, ValueHandlerBase } from '../../contract';

export class ValueService implements IValueService {

    private m_DiffValue: {
        [valueType: number]: number;
    } = {};

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
            await this.updateOne(r);
        }
    }

    public async updateOne(value: Value) {
        value.count = Number(value.count);
        value.valueType = Number(value.valueType);
        if (isNaN(value.count))
            throw new Error(`无效的 value: ${JSON.stringify(value)}`);
        if (isNaN(value.valueType))
            throw new Error(`无效的 value: ${JSON.stringify(value)}`);

        const oldCount = this.ownValue[value.valueType] ?? 0;
        await this.m_ValueHandler?.updateHandle({
            value: value,
            valueService: this
        });
        const newCount = this.ownValue[value.valueType] ?? 0;
        if (newCount != oldCount) {
            this.m_DiffValue[value.valueType] ??= 0;
            this.m_DiffValue[value.valueType] += newCount - oldCount;
        }
    }

    public getDiffValues(flush = false) {
        const values = Object.entries(this.m_DiffValue).map(([key, value]) => {
            return {
                valueType: Number(key),
                count: value
            };
        });
        if (flush) {
            this.m_DiffValue = {};
        }
        return values;
    }
}
