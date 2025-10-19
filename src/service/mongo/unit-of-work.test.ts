import { notStrictEqual, strictEqual } from 'assert';
import { ClientSession, Collection, Db, Document, MongoClient } from 'mongodb';

import { MongoUnitOfWork as Self } from './unit-of-work';
import { Mock } from '../mock';
import { DbFactoryBase } from '../../contract';

describe('src/service/mongo/unit-of-work.ts', () => {
    describe('.registerAdd(model: string, entry: DbModel)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, {});
            self.registerAdd('TestModel', {
                id: '1'
            });
            const bulk = Reflect.get(self, 'm_Bulk');
            strictEqual(bulk['TestModel'].length, 1);
        });
    });

    describe('.registerRemove(model: string, where: any)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, {});
            self.registerRemove('TestModel', {
                id: '1'
            });
            const bulk = Reflect.get(self, 'm_Bulk');
            strictEqual(bulk['TestModel'].length, 1);
        });
    });

    describe('.registerSave(model: string, entry: DbModel)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, {});
            self.registerSave('TestModel', {
                id: '1'
            });
            const bulk = Reflect.get(self, 'm_Bulk');
            strictEqual(bulk['TestModel'].length, 1);
        });
    });

    describe('.registerAfterCommit(action: Action, key?: string)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, {});
            self.registerAfterCommit(() => { }, 'commit1');
            const afterAction = Reflect.get(self, 'm_AfterAction');
            notStrictEqual(afterAction['commit1'], undefined);
        });
    });

    describe('.commit()', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual, {});
            self.registerAdd('TestModel', { id: '1' });

            const mockMongoClient = new Mock<MongoClient>();
            mockDbFactory.exceptReturn(
                r => r.getOriginConnection<MongoClient>(),
                mockMongoClient.actual
            );

            const mockClientSession = new Mock<ClientSession>();
            mockMongoClient.exceptReturn(
                r => r.startSession({
                    defaultTransactionOptions: {
                        writeConcern: {
                            w: 1
                        },
                        maxCommitTimeMS: 10000
                    }
                }),
                mockClientSession.actual
            );

            const mockDb = new Mock<Db>();
            mockMongoClient.exceptReturn(
                r => r.db(),
                mockDb.actual
            );

            const mockCollection = new Mock<Collection<Document>>();
            mockDb.exceptReturn(
                r => r.collection('TestModel'),
                mockCollection.actual
            );

            mockCollection.except.bulkWrite([
                {
                    insertOne: {
                        document: {
                            _id: '1'
                        } as Document
                    }
                }
            ], {
                session: mockClientSession.actual
            });

            mockClientSession.except.endSession();

            await self.commit();
        });
    });
});
