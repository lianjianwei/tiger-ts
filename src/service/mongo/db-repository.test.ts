import { deepStrictEqual, strictEqual } from 'assert';
import { Collection, Db, Document, FindCursor, MongoClient, WithId } from 'mongodb';

import { MongoDbRepository } from './db-repository';
import { Mock } from '../mock';
import { BuilderOption, DbFactoryBase, DbModel } from '../../contract';

class Enum extends DbModel {
    public items: any[];
}

describe('src/service/mongo/db-repository.ts', () => {
    describe('.count(where?: any)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum' };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockMongoClient = new Mock<MongoClient>();
            mockDbFactory.exceptReturn(
                r => r.getOriginConnection<MongoClient>(),
                mockMongoClient.actual
            );

            const mockDb = new Mock<Db>();
            mockMongoClient.exceptReturn(
                r => r.db(),
                mockDb.actual
            );

            const mockCollection = new Mock<Collection>();
            mockDb.exceptReturn(
                r => r.collection('Enum'),
                mockCollection.actual
            );

            mockCollection.exceptReturn(
                r => r.countDocuments({}),
                1
            );

            const res = await self.count();
            strictEqual(res, 1);
        });
    });

    describe('.findOne(opt?: QueryOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum' };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockMongoClient = new Mock<MongoClient>();
            mockDbFactory.exceptReturn(
                r => r.getOriginConnection<MongoClient>(),
                mockMongoClient.actual
            );

            const mockDb = new Mock<Db>();
            mockMongoClient.exceptReturn(
                r => r.db(),
                mockDb.actual
            );

            const mockCollection = new Mock<Collection>();
            mockDb.exceptReturn(
                r => r.collection('Enum'),
                mockCollection.actual
            );

            mockCollection.exceptReturn(
                r => r.findOne({
                    _id: 'LoginData' as any,
                }, {}),
                {
                    _id: 'LoginData',
                    items: [
                        {
                            value: 1,
                            text: '1'
                        }
                    ]
                }
            );

            const res = await self.findOne({
                where: {
                    id: 'LoginData'
                }
            });
            deepStrictEqual(res, {
                id: 'LoginData',
                items: [
                    {
                        value: 1,
                        text: '1'
                    }
                ]
            });
        });
    });

    describe('.findAll(opt?: QueryOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum' };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockMongoClient = new Mock<MongoClient>();
            mockDbFactory.exceptReturn(
                r => r.getOriginConnection<MongoClient>(),
                mockMongoClient.actual
            );

            const mockDb = new Mock<Db>();
            mockMongoClient.exceptReturn(
                r => r.db(),
                mockDb.actual
            );

            const mockCollection = new Mock<Collection>();
            mockDb.exceptReturn(
                r => r.collection('Enum'),
                mockCollection.actual
            );

            const mockCursor = new Mock<FindCursor<WithId<Document>>>();
            mockCollection.exceptReturn(
                r => r.find({
                    _id: 'LoginData' as any,
                }, {}),
                mockCursor.actual
            );

            mockCursor.exceptReturn(
                r => r.toArray(),
                [{
                    _id: 'LoginData',
                    items: [
                        {
                            value: 1,
                            text: '1'
                        }
                    ]
                }]
            );

            const res = await self.findAll({
                where: {
                    id: 'LoginData'
                }
            });
            deepStrictEqual(res, [{
                id: 'LoginData',
                items: [
                    {
                        value: 1,
                        text: '1'
                    }
                ]
            }]);
        });
    });


    describe('.find(opt?: QueryOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum' };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockMongoClient = new Mock<MongoClient>();
            mockDbFactory.exceptReturn(
                r => r.getOriginConnection<MongoClient>(),
                mockMongoClient.actual
            );

            const mockDb = new Mock<Db>();
            mockMongoClient.exceptReturn(
                r => r.db(),
                mockDb.actual
            );

            const mockCollection = new Mock<Collection>();
            mockDb.exceptReturn(
                r => r.collection('Enum'),
                mockCollection.actual
            );

            const mockCursor = new Mock<FindCursor<WithId<Document>>>();
            mockCollection.exceptReturn(
                r => r.find({
                    _id: 'LoginData' as any,
                }, {}),
                mockCursor.actual
            );

            mockCursor.exceptReturn(
                r => r.toArray(),
                [
                    {
                        _id: 'LoginData',
                        items: [
                            {
                                value: 1,
                                text: '1'
                            }
                        ]
                    },
                    {
                        _id: 'EnumData',
                        items: [
                            {
                                value: 1,
                                text: '1'
                            }
                        ]
                    }
                ]
            );

            const res = await self.findAll({
                where: {
                    id: 'LoginData'
                }
            });
            deepStrictEqual(res, [
                {
                    id: 'LoginData',
                    items: [
                        {
                            value: 1,
                            text: '1'
                        }
                    ]
                },
                {
                    id: 'EnumData',
                    items: [
                        {
                            value: 1,
                            text: '1'
                        }
                    ]
                }
            ]);
        });
    });
});
