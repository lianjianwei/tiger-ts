import { FindOptions } from 'sequelize';

import { SequelizeDbFactory } from './db-factory';
import { SequelizeUnitOfWork } from './unit-of-work';
import { ioc } from '../ioc';
import { BuilderOption, DbModel, IDbRepository, IDType, QueryOption } from '../../contract';

export class SequelizeDbRepository<T extends DbModel> implements IDbRepository<T> {

    private m_Model: string;

    protected get isTx() {
        return !!this.m_Option.uow;
    }

    private m_Uow: SequelizeUnitOfWork;
    protected get uow() {
        this.m_Uow ??= (this.m_Option.uow ?? this.m_DbFactory.uow()) as SequelizeUnitOfWork;
        return this.m_Uow;
    }

    public constructor(
        private m_DbFactory: SequelizeDbFactory,
        private m_Option: BuilderOption<T>
    ) {
        this.m_Model = ioc.getKey(m_Option.model);
    }

    public async add(entry: T) {
        this.uow.registerAdd(this.m_Model, entry, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async bulkAdd(entries: T[]) {
        this.uow.registerBulkAdd(this.m_Model, entries, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }
    
    public async remove(where: any) {
        this.uow.registerRemove(this.m_Model, where, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async removeById(id: IDType): Promise<void> {
        this.uow.registerRemove(this.m_Model, { id }, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async save(entry: T): Promise<void> {
        this.uow.registerSave(this.m_Model, entry, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async count(where?: any): Promise<number> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        return dbModel.count({
            where: where
        });
    }

    public async findOne(opt?: QueryOption): Promise<T> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        const options: FindOptions = {
            where: opt.where
        };
        if (opt.skip) {
            options.offset = opt.skip;
        }
        if (opt.take) {
            options.limit = opt.take;
        }
        if (opt.order) {
            options.order = opt.order.map(o => [o.field, o.direction]);
        }
        const doc = await dbModel.findOne(options);
        return doc?.dataValues as T;
    }

    public async findAll(opt?: QueryOption): Promise<T[]> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        const options: FindOptions = {
            where: opt.where
        };
        if (opt.skip) {
            options.offset = opt.skip;
        }
        if (opt.take) {
            options.limit = opt.take;
        }
        if (opt.order) {
            options.order = opt.order.map(o => [o.field, o.direction]);
        }
        const docs = await dbModel.findAll(options);
        return docs.map(d => d.dataValues) as T[];
    }
}
