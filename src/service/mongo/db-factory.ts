import { BulkWriteOptions, Collection, Document, MongoClient, MongoClientOptions } from 'mongodb';

import { MongoDbRepository } from './db-repository';
import { MongoUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository, IUnitOfWork } from '../../contract';

export class MongoDbFactory extends DbFactoryBase {

    private m_MongoClientMap: {
        [srvNo: number]: Promise<MongoClient>
    } = {};

    public constructor(
        private m_Url: string,
        private m_DbName: string,
        private m_GetMongoClient: (srvNo: number) => Promise<MongoClient>,
        private m_BulkWriteOptions: BulkWriteOptions = {},
        private m_Option?: MongoClientOptions
    ) {
        super();
    }

    public getOriginConnection<T>(srvNo?: number) {
        srvNo ??= 0;
        this.m_MongoClientMap[srvNo] ??= new Promise<MongoClient>(async (s, f) => {
            try {
                const client = srvNo ? await this.m_GetMongoClient(srvNo) : new MongoClient(this.m_Url, this.m_Option);
                await client.connect();
                s(client);
            } catch (err) {
                f(err);
            }
        });
        return this.m_MongoClientMap[srvNo] as Promise<T>;
    }

    public build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T> {
        return new MongoDbRepository<T>(this, opt);
    }

    public uow(): IUnitOfWork {
        return new MongoUnitOfWork(this, this.m_BulkWriteOptions);
    }

    public async close(srvNo: number) {
        if (this.m_MongoClientMap[srvNo]) {
            const mongClientPromise = this.m_MongoClientMap[srvNo];
            delete this.m_MongoClientMap[srvNo];
            const mongClient = await mongClientPromise;
            await mongClient.close();
        }
    }

    public async getCollection(srvNo: number, collection: string): Promise<Collection<Document>> {
        srvNo ??= 0;
        const client = await this.getOriginConnection<MongoClient>(srvNo);
        const dbName = srvNo ? `${this.m_DbName}-${srvNo}` : this.m_DbName;
        return client.db(dbName).collection<Document>(collection);
    }
}
