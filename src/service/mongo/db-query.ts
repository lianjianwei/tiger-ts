import { FindOptions, MongoClient, SortDirection, WithId, Document } from 'mongodb';

import { DbFactoryBase, DbModel, IDbQuery, QueryOption } from '../../contract';

export class MongoDbQuery<T extends DbModel> implements IDbQuery<T> {

    public constructor(
        private m_DbFactory: DbFactoryBase,
        private m_Model: string
    ) { }

    public async count(where: any = {}) {
        const collection = await this.getCollection();

        if (where.id)
            where._id ??= where.id;

        return await collection.countDocuments(where);
    }

    public async findOne(opt: QueryOption = {}) {
        const collection = await this.getCollection();

        if (opt.where?.id && !opt.where._id) {
            opt.where = Object.assign({}, opt.where);
            opt.where._id = opt.where.id;
            delete opt.where.id;
        }

        const options: FindOptions = {};
        if (opt.skip)
            options.skip = opt.skip;
        if (opt.take)
            options.limit = opt.take;
        if (opt.order) {
            options.sort = opt.order.reduce((memo, r) => {
                memo.set(r, 1);
                return memo;
            }, new Map<string, SortDirection>());
        }
        if (opt.orderByDesc) {
            options.sort = opt.order.reduce((memo, r) => {
                memo.set(r, -1);
                return memo;
            }, new Map<string, SortDirection>());
        }

        const doc = await collection.findOne(opt.where, options);
        return this.docToModel(doc);
    }

    public async findAll(opt: QueryOption = {}) {
        const collection = await this.getCollection();

        if (opt.where?.id && !opt.where._id) {
            opt.where = Object.assign({}, opt.where);
            opt.where._id = opt.where.id;
            delete opt.where.id;
        }

        const options: FindOptions = {};
        if (opt.skip)
            options.skip = opt.skip;
        if (opt.take)
            options.limit = opt.take;
        if (opt.order) {
            options.sort = opt.order.reduce((memo, r) => {
                memo.set(r, 1);
                return memo;
            }, new Map<string, SortDirection>());
        }
        if (opt.orderByDesc) {
            options.sort = opt.order.reduce((memo, r) => {
                memo.set(r, -1);
                return memo;
            }, new Map<string, SortDirection>());
        }

        const cursor = collection.find(opt.where, options);
        const entries = await cursor.toArray();
        return entries.map(r => this.docToModel(r));
    }

    private async getCollection() {
        const client = await this.m_DbFactory.getOriginConnection<MongoClient>();
        const db = client.db();
        return db.collection(this.m_Model);
    }

    private docToModel(doc: WithId<Document>): T {
        if (!doc)
            return null;

        return Object.keys(doc).reduce((memo, r) => {
            if (r != '_id')
                memo[r] = doc[r];

            return memo;
        }, {
            id: doc._id
        } as any);
    }
}
