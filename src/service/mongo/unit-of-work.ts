import { AnyBulkWriteOperation, BulkWriteOptions, Document, MongoClient } from 'mongodb';

import { MongoDbFactory } from './db-factory';
import { Action, DbModel, IDType, IUnitOfWork, MongoUpdateOption } from '../../contract';

export class MongoUnitOfWork implements IUnitOfWork {

    private m_AfterAction: {
        [key: string]: Action;
    } = {};

    private m_Bulk: {
        [srvNo: number]: {
            [model: string]: AnyBulkWriteOperation<Document>[];
        }
    } = {};

    public constructor(
        private m_DbFactory: MongoDbFactory,
        private m_BulkWriteOptions: BulkWriteOptions
    ) { }

    public registerAdd(model: string, entry: DbModel, srvNo: number) {
        this.m_Bulk[srvNo] ??= {};
        this.m_Bulk[srvNo][model] ??= [];
        this.m_Bulk[srvNo][model].push({
            insertOne: {
                document: this.toDoc(entry)
            }
        });
    }

    public registerRemove(model: string, where: any, srvNo: number) {
        this.m_Bulk[srvNo] ??= {};
        this.m_Bulk[srvNo][model] ??= [];
        const filter = Object.assign({}, where || {});
        if (filter.id && !filter._id) {
            filter._id = filter.id;
            delete filter.id;
        }
        this.m_Bulk[srvNo][model].push({
            deleteMany: {
                filter: filter
            }
        });
    }

    public registerSave(model: string, entry: DbModel, srvNo: number) {
        this.m_Bulk[srvNo] ??= {};
        this.m_Bulk[srvNo][model] ??= [];
        const doc = this.toDoc(entry);
        this.m_Bulk[srvNo][model].push({
            updateOne: {
                filter: {
                    _id: doc._id
                },
                update: {
                    $set: doc
                }
            }
        });
    }

    public registerUpdate(model: string, id: IDType, entry: MongoUpdateOption, srvNo: number) {
        this.m_Bulk[srvNo] ??= {};
        this.m_Bulk[srvNo][model] ??= [];
        this.m_Bulk[srvNo][model].push({
            updateOne: {
                filter: {
                    _id: id as any
                },
                update: entry
            }
        });
    }

    public registerAfterCommit(action: Action, key?: string) {
        key ??= `action-${Object.keys(this.m_AfterAction).length + 1}`;
        this.m_AfterAction[key] = action;
    }

    public async commit() {
        const bulks = Object.entries(this.m_Bulk);
        const action = this.m_AfterAction;
        this.m_Bulk = {};
        this.m_AfterAction = {};

        for (const [srvNoStr, srvBulk] of bulks) {
            const srvNo = Number(srvNoStr);
            const client = await this.m_DbFactory.getOriginConnection<MongoClient>(srvNo);
            const session = client.startSession({
                defaultTransactionOptions: {
                    writeConcern: {
                        w: 1
                    },
                    maxCommitTimeMS: 10000
                }
            });
            for (const [model, ops] of Object.entries(srvBulk)) {
                const collection = await this.m_DbFactory.getCollection(srvNo, model);
                await collection.bulkWrite(ops, {
                    ...this.m_BulkWriteOptions,
                    session: session
                });
            }
            await session.endSession();
        }

        await Promise.all(Object.values(action).map(r => r()));
    }

    private toDoc(entry: any) {
        return Object.keys(entry).reduce((memo, r) => {
            if (r != 'id')
                memo[r] = entry[r];

            return memo;
        }, {
            _id: entry.id
        } as Document);
    }
}
