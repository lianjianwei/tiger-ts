import { deepStrictEqual, strictEqual } from 'assert';
import { ModelStatic, Model } from 'sequelize';

import { SequelizeDbFactory } from './db-factory';
import { SequelizeDbRepository } from './db-repository';
import { Mock } from '../mock';
import { BuilderOption, DbModel } from '../../contract';

class Enum extends DbModel {
    public items: any[];
}

describe('src/service/sequelize/db-repository.ts', () => {
    describe('.count(where?: any)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<SequelizeDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new SequelizeDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockModel = new Mock<ModelStatic<Model<any, any>>>();
            mockDbFactory.exceptReturn(
                r => r.getModel('Enum', 0),
                mockModel.actual
            );

            mockModel.exceptReturn(
                r => r.count({
                    where: undefined
                }),
                2
            );

            const res = await self.count();
            strictEqual(res, 2);
        });
    });

    describe('.findOne(opt?: QueryOption)', () => {
        it('include 只返回指定字段（Sequelize 默认不含主键）', async () => {
            const mockDbFactory = new Mock<SequelizeDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new SequelizeDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockModel = new Mock<ModelStatic<Model<any, any>>>();
            mockDbFactory.exceptReturn(
                r => r.getModel('Enum', 0),
                mockModel.actual
            );

            mockModel.exceptReturn(
                r => r.findOne({
                    where: {},
                    attributes: ['items']
                }),
                {
                    dataValues: { items: [1] }
                }
            );

            const res = await self.findOne({
                where: {},
                fields: {
                    include: ['items']
                }
            });
            deepStrictEqual(res, { items: [1] });
        });

        it('exclude 排除指定字段', async () => {
            const mockDbFactory = new Mock<SequelizeDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new SequelizeDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockModel = new Mock<ModelStatic<Model<any, any>>>();
            mockDbFactory.exceptReturn(
                r => r.getModel('Enum', 0),
                mockModel.actual
            );

            mockModel.exceptReturn(
                r => r.findOne({
                    where: {},
                    attributes: { exclude: ['secret'] }
                }),
                {
                    dataValues: { items: [1] }
                }
            );

            const res = await self.findOne({
                where: {},
                fields: {
                    exclude: ['secret']
                }
            });
            deepStrictEqual(res, { items: [1] });
        });
    });

    describe('.findAll(opt?: QueryOption)', () => {
        it('include 只返回指定字段（Sequelize 默认不含主键）', async () => {
            const mockDbFactory = new Mock<SequelizeDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new SequelizeDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockModel = new Mock<ModelStatic<Model<any, any>>>();
            mockDbFactory.exceptReturn(
                r => r.getModel('Enum', 0),
                mockModel.actual
            );

            mockModel.exceptReturn(
                r => r.findAll({
                    where: {},
                    attributes: ['items']
                }),
                [
                    { dataValues: { items: [1] } }
                ]
            );

            const res = await self.findAll({
                where: {},
                fields: {
                    include: ['items']
                }
            });
            deepStrictEqual(res, [{ items: [1] }]);
        });

        it('exclude 排除指定字段', async () => {
            const mockDbFactory = new Mock<SequelizeDbFactory>();
            const builderOption: BuilderOption<Enum> = { model: 'Enum', srvNo: 0 };
            const self = new SequelizeDbRepository<Enum>(mockDbFactory.actual, builderOption);

            const mockModel = new Mock<ModelStatic<Model<any, any>>>();
            mockDbFactory.exceptReturn(
                r => r.getModel('Enum', 0),
                mockModel.actual
            );

            mockModel.exceptReturn(
                r => r.findAll({
                    where: {},
                    attributes: { exclude: ['secret'] }
                }),
                [
                    { dataValues: { items: [1] } }
                ]
            );

            const res = await self.findAll({
                where: {},
                fields: {
                    exclude: ['secret']
                }
            });
            deepStrictEqual(res, [{ items: [1] }]);
        });
    });
});
