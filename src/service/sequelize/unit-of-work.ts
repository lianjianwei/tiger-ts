import { Sequelize } from 'sequelize';

import { SequelizeDbFactory } from './db-factory';
import { Action, DbModel, IUnitOfWork } from '../../contract';

export class SequelizeUnitOfWork implements IUnitOfWork {

    private m_AfterAction: {
        [key: string]: Action;
    } = {};

    private m_Bulk: {
        [srvNo: number]: {
            model: string;
            type: 'add' | 'save' | 'remove' | 'bulkAdd';
            entry?: DbModel;
            entries?: DbModel[];
            where?: any;
        }[]
    } = {};

    public constructor(
        private m_DbFactory: SequelizeDbFactory
    ) {}

    public registerAdd(model: string, entry: DbModel, srvNo: number) {
        this.m_Bulk[srvNo] ??= [];
        this.m_Bulk[srvNo].push({
            model,
            type: 'add',
            entry,
        });
    }

    public registerBulkAdd(model: string, entries: DbModel[], srvNo: number) {
        this.m_Bulk[srvNo] ??= [];
        this.m_Bulk[srvNo].push({
            model,
            type: 'bulkAdd',
            entries,
        });
    }

    public registerRemove(model: string, where: any, srvNo: number) {
        this.m_Bulk[srvNo] ??= [];
        this.m_Bulk[srvNo].push({
            model,
            type: 'remove',
            where,
        });
    }

    public registerSave(model: string, entry: DbModel, srvNo: number) {
        this.m_Bulk[srvNo] ??= [];
        this.m_Bulk[srvNo].push({
            model,
            type: 'save',
            entry,
        });
    }

    public registerAfterCommit(action: Action, key?: string): void {
        key ??= `action-${Object.keys(this.m_AfterAction).length + 1}`;
        this.m_AfterAction[key] = action;
    }

    public async commit() {
        const allBulks = Object.entries(this.m_Bulk);
        this.m_Bulk = {};

        try {
            for (const [key, bulks] of allBulks) {
                const srvNo = Number(key);
                const sequelize = await this.m_DbFactory.getOriginConnection<Sequelize>(srvNo);
                const client = await sequelize.transaction();
                try {
                    for (const r of bulks) {
                        const dbModel = await this.m_DbFactory.getModel(r.model, srvNo);
                        if (r.type === 'add') {
                            await dbModel.create(r.entry as any, { transaction: client });
                        } else if (r.type === 'bulkAdd') {
                            await dbModel.bulkCreate(r.entries as any[], { transaction: client });
                        } else if (r.type === 'remove') {
                            await dbModel.destroy({ where: r.where, transaction: client });
                        } else if (r.type === 'save') {
                            await dbModel.update(r.entry as any, { where: { id: r.entry.id }, transaction: client });
                        }
                    }
                    await client.commit();
                } catch (error) {
                    await client.rollback();
                    throw error;
                }
            }
        } finally {
            const tasks = Object.values(this.m_AfterAction).map(r => r());
            await Promise.all(tasks);
        }
    }
}
