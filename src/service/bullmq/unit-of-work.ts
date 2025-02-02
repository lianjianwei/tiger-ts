import { Queue } from 'bullmq';

import { Action, DbModel, IUnitOfWork } from '../../contract';

export class BullmqUnitOfWork implements IUnitOfWork {

    private m_AfterAction: {
        [key: string]: Action;
    } = {};

    private m_Bulk: {
        [model: string]: {
            type: 'add' | 'remove' | 'save',
            entry: DbModel;
        }[];
    } = {};

    public constructor(
        private m_Queue: Queue
    ) { }

    public registerAdd(model: string, entry: DbModel) {
        this.m_Bulk[model] ??= [];
        this.m_Bulk[model].push({
            type: 'add',
            entry: entry
        });
    }

    public registerRemove(model: string, entry: DbModel) {
        this.m_Bulk[model] ??= [];
        this.m_Bulk[model].push({
            type: 'remove',
            entry: entry
        });
    }

    public registerSave(model: string, entry: DbModel) {
        this.m_Bulk[model] ??= [];
        const item = this.m_Bulk[model].find(r => r.type == 'save' && r.entry.id == entry.id);
        if (item) {
            item.entry = entry;
        } else {
            this.m_Bulk[model].push({
                type: 'save',
                entry: entry
            });
        }
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

        if (bulks.length) {
            await this.m_Queue.add('db-op', bulks);
        }

        await Promise.all(Object.values(action).map(r => r()));
    }
}
