import { BulkWriteOptions, Collection, Document, MongoClient, MongoClientOptions } from 'mongodb';

import { MongoDbRepository } from './db-repository';
import { MongoUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository, IUnitOfWork } from '../../contract';

export class MongoDbFactory extends DbFactoryBase {

    private m_SrvMongoClientMap: {
        [srvNo: number]: Promise<MongoClient>
    } = {};

    private m_UrlMongoClientMap: {
        [url: string]: {
            client: MongoClient,
            count: number;
        }
    } = {};

    private m_SrvUrlMap: {
        [srvNo: number]: string;
    } = {};

    public constructor(
        private m_Url: string,
        private m_DbName: string,
        private m_GetMongoUrl: (srvNo: number) => Promise<string>,
        private m_BulkWriteOptions: BulkWriteOptions = {},
        private m_Option?: MongoClientOptions
    ) {
        super();
    }

    public getOriginConnection<T>(srvNo?: number) {
        srvNo ??= 0;
        this.m_SrvMongoClientMap[srvNo] ??= new Promise<MongoClient>(async (s, f) => {
            try {
                const url = srvNo ? await this.m_GetMongoUrl(srvNo) : this.m_Url;
                this.m_UrlMongoClientMap[url] ??= {
                    client: new MongoClient(url, this.m_Option),
                    count: 0,
                };
                this.m_SrvUrlMap[srvNo] = url;
                this.m_UrlMongoClientMap[url].count++;
                await this.m_UrlMongoClientMap[url].client.connect();
                s(this.m_UrlMongoClientMap.client[url]);
            } catch (err) {
                f(err);
            }
        });
        return this.m_SrvMongoClientMap[srvNo] as Promise<T>;
    }

    public build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T> {
        return new MongoDbRepository<T>(this, opt);
    }

    public uow(): IUnitOfWork {
        return new MongoUnitOfWork(this, this.m_BulkWriteOptions);
    }

    public async close(srvNo: number) {
        if (this.m_SrvMongoClientMap[srvNo]) {
            const url = this.m_SrvUrlMap[srvNo];
            delete this.m_SrvMongoClientMap[srvNo];
            delete this.m_SrvUrlMap[srvNo];
            const urlMongoClient = this.m_UrlMongoClientMap[url];
            if (urlMongoClient) {
                urlMongoClient.count--;
                if (urlMongoClient.count <= 0) {
                    delete this.m_UrlMongoClientMap[url];
                    await urlMongoClient.client.close();
                }
            }
        }
    }

    public async getCollection(srvNo: number, collection: string): Promise<Collection<Document>> {
        srvNo ??= 0;
        const client = await this.getOriginConnection<MongoClient>(srvNo);
        const dbName = srvNo ? `${this.m_DbName}-${srvNo}` : this.m_DbName;
        return client.db(dbName).collection<Document>(collection);
    }
}
