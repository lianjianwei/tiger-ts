import { Condition, IValueService, OwnValue, Value, ValueHandlerBase } from '../../contract';

export class ValueService implements IValueService {

    public constructor(
        public ownValue: OwnValue,
        private m_ValueHandler: ValueHandlerBase
    ) { }

    public checkCondition(conditions: Condition[][]) {
        if (!conditions || !conditions.length)
            return true;

        const results = conditions.map(r => {
            const res = r.map(cr => {
                const count = this.getCount(cr.valueType);
                switch (cr.op) {
                    case '>':
                        return count > cr.count;
                    case '>=':
                        return count >= cr.count;
                    case '<':
                        return count < cr.count;
                    case '<=':
                        return count <= cr.count;
                    default:
                        return count == cr.count;
                }
            });
            return res.every(cr => cr);
        });
        return results.some(r => r);
    }

    public getCount(valueType: number) {
        valueType = Number(valueType);
        if (isNaN(valueType))
            throw new Error(`无效的 valueType: [${valueType}]`);

        const value: Value = {
            valueType: valueType,
            count: this.ownValue[valueType] ?? 0
        };

        this.m_ValueHandler?.getCountHandle({
            value: value,
            valueService: this
        });

        return value.count;
    }

    public update(values: Value[]) {
        for (const r of values ?? []) {
            r.count = Number(r.count);
            r.valueType = Number(r.valueType);
            if (isNaN(r.count))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);
            if (isNaN(r.valueType))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);

            this.m_ValueHandler?.updateHandle({
                value: r,
                valueService: this
            });
        }
    }
}
