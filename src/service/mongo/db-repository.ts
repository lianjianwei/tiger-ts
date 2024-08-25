import { MongoDbQuery } from './db-query';
import { MongoUnitOfWork } from './unit-of-work';
import { ioc } from '../ioc';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository } from '../../contract';

export class MongoDbRepository<T extends DbModel> implements IDbRepository<T> {

    private m_Model: string;

    /**
     * 是否事务
     */
    protected get isTx() {
        return !!this.m_Opt.uow;
    }

    /**
     * 工作单元
     */
    protected get uow() {
        return (this.m_Opt.uow ?? this.m_DbFactory.uow()) as MongoUnitOfWork;
    }

    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_Opt: BuilderOption<T>
    ) {
        this.m_Model = ioc.getKey(this.m_Opt.model);
    }

    public async add(entry: T) {
        this.uow.registerAdd(this.m_Model, entry);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async remove(entry: T) {
        this.uow.registerRemove(this.m_Model, entry);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async save(entry: T) {
        this.uow.registerSave(this.m_Model, entry);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public query() {
        return new MongoDbQuery<T>(this.m_DbFactory, this.m_Model);
    }
}
