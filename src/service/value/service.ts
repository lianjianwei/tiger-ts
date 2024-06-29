import { Condition, IUnitOfWork, IValueService, OwnValue, Value, ValueHandlerBase } from '../../contract';

export class ValueService implements IValueService {

    public constructor(
        public ownValue: OwnValue,
        private m_ValueHandler: ValueHandlerBase
    ) { }

    public async checkCondition(uow: IUnitOfWork, conditions: Condition[][]) {
        if (!conditions || !conditions.length)
            return true;

        const results = await Promise.all(conditions.map(async r => {
            const res = await Promise.all(r.map(async cr => {
                const count = await this.getCount(uow, cr.valueType);
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
            }));
            return res.every(cr => cr);
        }));
        return results.some(r => r);
    }

    public async getCount(uow: IUnitOfWork, valueType: number) {
        valueType = Number(valueType);
        if (isNaN(valueType))
            throw new Error(`无效的 valueType: [${valueType}]`);

        const value: Value = {
            valueType: valueType,
            count: this.ownValue[valueType] ?? 0
        };

        await this.m_ValueHandler?.getCountHandle({
            uow: uow,
            value: value,
            valueService: this
        });

        return value.count;
    }

    public async update(uow: IUnitOfWork, values: Value[]) {
        for (const r of values ?? []) {
            r.count = Number(r.count);
            r.valueType = Number(r.valueType);
            if (isNaN(r.count))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);
            if (isNaN(r.valueType))
                throw new Error(`无效的 value: ${JSON.stringify(r)}`);

            await this.m_ValueHandler?.updateHandle({
                uow: uow,
                value: r,
                valueService: this
            });
        }
    }
}
