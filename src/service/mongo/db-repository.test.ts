import { deepStrictEqual, strictEqual } from 'assert';
import { Collection, Document, FindCursor, WithId } from 'mongodb';

import { MongoDbFactory } from './db-factory';
import { MongoDbRepository } from './db-repository';
import { Mock } from '../mock';
import { BuilderOption, DbModel } from '../../contract';

class Enum extends DbModel {
    public items: any[];
}

describe('src/service/mongo/db-repository.ts', () => {
    describe('.count(where?: any)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
                mockCollection.actual
            );

            mockCollection.exceptReturn(
                r => r.estimatedDocumentCount(),
                1
            );

            const res = await self.count();
            strictEqual(res, 1);
        });
    });

    describe('.findOne(opt?: QueryOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
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
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
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


    describe('.findAll fields 投影', () => {
        it('include 只返回指定字段（Mongo 默认仍返回 _id）', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
                mockCollection.actual
            );

            const mockCursor = new Mock<FindCursor<WithId<Document>>>();
            mockCollection.exceptReturn(
                r => r.find({
                    _id: 'LoginData' as any,
                }, {
                    projection: { items: 1 }
                }),
                mockCursor.actual
            );

            mockCursor.exceptReturn(
                r => r.toArray(),
                [{
                    _id: 'LoginData',
                    items: [1]
                }]
            );

            const res = await self.findAll({
                where: {
                    id: 'LoginData'
                },
                fields: {
                    include: ['items']
                }
            });
            deepStrictEqual(res, [{
                id: 'LoginData',
                items: [1]
            }]);
        });

        it('exclude 排除指定字段', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
                mockCollection.actual
            );

            const mockCursor = new Mock<FindCursor<WithId<Document>>>();
            mockCollection.exceptReturn(
                r => r.find({
                    _id: 'LoginData' as any,
                }, {
                    projection: { secret: 0 }
                }),
                mockCursor.actual
            );

            mockCursor.exceptReturn(
                r => r.toArray(),
                [{
                    _id: 'LoginData',
                    items: [1]
                }]
            );

            const res = await self.findAll({
                where: {
                    id: 'LoginData'
                },
                fields: {
                    exclude: ['secret']
                }
            });
            deepStrictEqual(res, [{
                id: 'LoginData',
                items: [1]
            }]);
        });
    });

    describe('.findOne fields 投影', () => {
        it('include 只返回指定字段（Mongo 默认仍返回 _id）', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
                mockCollection.actual
            );

            mockCollection.exceptReturn(
                r => r.findOne({
                    _id: 'LoginData' as any,
                }, {
                    projection: { items: 1 }
                }),
                {
                    _id: 'LoginData',
                    items: [1]
                }
            );

            const res = await self.findOne({
                where: {
                    id: 'LoginData'
                },
                fields: {
                    include: ['items']
                }
            });
            deepStrictEqual(res, {
                id: 'LoginData',
                items: [1]
            });
        });

        it('exclude 排除指定字段', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
                mockCollection.actual
            );

            mockCollection.exceptReturn(
                r => r.findOne({
                    _id: 'LoginData' as any,
                }, {
                    projection: { secret: 0 }
                }),
                {
                    _id: 'LoginData',
                    items: [1]
                }
            );

            const res = await self.findOne({
                where: {
                    id: 'LoginData'
                },
                fields: {
                    exclude: ['secret']
                }
            });
            deepStrictEqual(res, {
                id: 'LoginData',
                items: [1]
            });
        });
    });

    describe('.find(opt?: QueryOption)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<MongoDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new MongoDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockCollection = new Mock<Collection>();
            mockDbFactory.exceptReturn(
                r => r.getCollection(0, 'Enum'),
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
