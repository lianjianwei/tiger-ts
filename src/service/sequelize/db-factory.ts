import { Options, Sequelize } from 'sequelize';

import { SequelizeDbRepository } from './db-repository';
import { SequelizeUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository, IUnitOfWork } from '../../contract';
import { COLUMN_METADATA, TABLE_METADATA } from '../../decorator';

export class SequelizeDbFactory extends DbFactoryBase {

    private m_SrvSequelizeClientMap: {
        [srvNo: number]: Promise<Sequelize>;
    } = {};

    public constructor(
        private m_Option: Options,
        private m_GetClientFunction: (srvNo: number) => Promise<Sequelize>
    ) {
        super();
    }

    public getOriginConnection<T>(srvNo = 0) {
        this.m_SrvSequelizeClientMap[srvNo] ??= new Promise<Sequelize>(async (s, f) => {
            try {
                const client = srvNo ? new Sequelize(this.m_Option) : await this.m_GetClientFunction(srvNo);
                await client.authenticate();
                s(client);
            } catch (error) {
                f(error);
            }
        });
        return this.m_SrvSequelizeClientMap[srvNo] as Promise<T>;
    }

    public build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T> {
        return new SequelizeDbRepository<T>(this, opt);
    }

    public uow(): IUnitOfWork {
        return new SequelizeUnitOfWork(this);
    }

    public async close(srvNo: number) {
        const clientPromise = this.m_SrvSequelizeClientMap[srvNo];
        if (clientPromise) {
            delete this.m_SrvSequelizeClientMap[srvNo];
            const client = await clientPromise;
            await client.close();
        }
    }

    public async getModel(modelName: string, srvNo = 0) {
        const client = await this.getOriginConnection<Sequelize>(srvNo);
        const model = client.models[modelName]
        if (model)
            return model;

        const columnMetadata = COLUMN_METADATA[modelName];
        if (!columnMetadata)
            throw new Error(`Model ${modelName} not defined.`);

        const fields = columnMetadata.reduce((memo, r) => {
            memo[r.attributeName] = r.option;
            return memo;
        }, {});

        return client.define(modelName, fields, {
            timestamps: false,
            underscored: false,
            ...TABLE_METADATA[modelName]?.options
        });
    }
}
