import { Queue } from 'bullmq';

import { BullmqUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel } from '../../contract';

export class BullmqDbFactory extends DbFactoryBase {

    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_Queue: Queue
    ) {
        super();
    }

    public getOriginConnection<T>() {
        return this.m_DbFactory.getOriginConnection<T>();
    }

    public build<T extends DbModel>(opt: BuilderOption<T>) {
        return this.m_DbFactory.build(opt);
    }

    public uow() {
        return new BullmqUnitOfWork(this.m_Queue);
    }
}
