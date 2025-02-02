import { BulkWriteOptions, MongoClient, MongoClientOptions } from 'mongodb';

import { MongoDbRepository } from './db-repository';
import { MongoUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository, IUnitOfWork } from '../../contract';

export class MongoDbFactory extends DbFactoryBase {

    private m_MongoClient: Promise<MongoClient>;

    public constructor(
        private m_Url: string,
        private m_BulkWriteOptions: BulkWriteOptions = {},
        private m_Option?: MongoClientOptions
    ) {
        super();
    }

    public getOriginConnection<T>() {
        this.m_MongoClient ??= new Promise<MongoClient>(async (s, f) => {
            const client = new MongoClient(this.m_Url, this.m_Option);
            try {
                await client.connect();
                s(client);
            } catch (err) {
                f(err);
            }
        });
        return this.m_MongoClient as Promise<T>;
    }

    public build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T> {
        return new MongoDbRepository<T>(this, opt);
    }

    public uow(): IUnitOfWork {
        return new MongoUnitOfWork(this, this.m_BulkWriteOptions);
    }
}
