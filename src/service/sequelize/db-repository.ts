import { FindOptions, ModelStatic } from 'sequelize';

import { SequelizeDbFactory } from './db-factory';
import { SequelizeUnitOfWork } from './unit-of-work';
import { ioc } from '../ioc';
import { BuilderOption, DbModel, IDbRepository, IDType, QueryOption, SyncOption } from '../../contract';
import { ModelOptions, TABLE_METADATA } from '../../decorator';

export class SequelizeDbRepository<T extends DbModel> implements IDbRepository<T> {

    private m_Model: string;

    protected get isTx() {
        return !!this.m_Option.uow;
    }

    private m_Uow: SequelizeUnitOfWork;
    protected get uow() {
        this.m_Uow ??= (this.m_Option.uow ?? this.m_DbFactory.uow()) as SequelizeUnitOfWork;
        return this.m_Uow;
    }

    public constructor(
        private m_DbFactory: SequelizeDbFactory,
        private m_Option: BuilderOption<T>
    ) {
        this.m_Model = ioc.getKey(m_Option.model);
    }

    public async add(entry: T) {
        this.uow.registerAdd(this.m_Model, entry, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async bulkAdd(entries: T[]) {
        this.uow.registerBulkAdd(this.m_Model, entries, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async remove(where: any) {
        this.uow.registerRemove(this.m_Model, where, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async removeById(id: IDType): Promise<void> {
        this.uow.registerRemove(this.m_Model, { id }, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async save(entry: T): Promise<void> {
        this.uow.registerSave(this.m_Model, entry, this.m_Option.srvNo);
        if (this.isTx)
            return;

        await this.uow.commit();
    }

    public async count(where?: any): Promise<number> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        return dbModel.count({
            where: where
        });
    }

    public async findOne(opt: QueryOption = {}): Promise<T> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        const options: FindOptions = {
            where: opt.where
        };
        if (opt.skip) {
            options.offset = opt.skip;
        }
        if (opt.take) {
            options.limit = opt.take;
        }
        if (opt.order) {
            options.order = opt.order.map(o => [o.field, o.direction]);
        }
        const doc = await dbModel.findOne(options);
        return doc?.dataValues as T;
    }

    public async findAll(opt: QueryOption = {}): Promise<T[]> {
        const dbModel = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        const options: FindOptions = {
            where: opt.where
        };
        if (opt.skip) {
            options.offset = opt.skip;
        }
        if (opt.take) {
            options.limit = opt.take;
        }
        if (opt.order) {
            options.order = opt.order.map(o => [o.field, o.direction]);
        }
        const docs = await dbModel.findAll(options);
        return docs.map(d => d.dataValues) as T[];
    }

    public async sync(opt: SyncOption = {}) {
        const tableMetaData = TABLE_METADATA[this.m_Model];
        if (!tableMetaData)
            return;

        if (tableMetaData.options.group && tableMetaData.options.group != opt.group)
            return;

        const model = await this.m_DbFactory.getModel(this.m_Model, this.m_Option.srvNo);
        if (tableMetaData.options.partitionBy) {
            if (model.sequelize.getDialect() != 'postgres') {
                throw new Error(`分区表仅支持PostgreSQL数据库`);
            }
            const sqls = this.getCreateTableQuery(model, tableMetaData.options);
            for (const sql of sqls) {
                await model.sequelize.query(sql);
            }
        } else {
            await model.sync(opt);
        }
    }

    private getCreateTableQuery(model: ModelStatic<any>, option: ModelOptions) {
        const sqls = [];
        let createTableSql = `CREATE TABLE IF NOT EXISTS "${model.options.tableName}" (`;
        const attributes = model.getAttributes();
        const primaryKeys: string[] = [];
        for (const key in attributes) {
            const attribute = attributes[key];
            createTableSql += `${attribute.field} ${attribute.type}`;

            if (attribute.primaryKey) {
                primaryKeys.push(attribute.field);
                if (attribute.autoIncrement || attribute.autoIncrementIdentity) {
                    // 自增字段处理
                    createTableSql += ' GENERATED ALWAYS AS IDENTITY';
                }
            }

            if (attribute.allowNull === false) {
                createTableSql += ` NOT NULL`;
            }
            if (attribute.defaultValue !== undefined) {
                const defaultValue = typeof attribute.defaultValue === 'string' ? `'${attribute.defaultValue}'` : attribute.defaultValue;
                createTableSql += ` DEFAULT ${defaultValue}`;
            }
            createTableSql += `,`;

            if (attribute.comment) {
                sqls.push(`COMMENT ON COLUMN "${model.options.tableName}"."${attribute.field}" IS '${attribute.comment}';`);
            }
        }
        createTableSql += `PRIMARY KEY (${primaryKeys.join(', ')}) )`;
        if (option.partitionBy.type == 'RANGE') {
            createTableSql += ` PARTITION BY RANGE (${option.partitionBy.field}) `;
        } else if (option.partitionBy.type == 'HASH') {
            createTableSql += ` PARTITION BY HASH (${option.partitionBy.field}) `;
        } else {
            throw new Error(`不支持的分区类型[${option.partitionBy.type}]`);
        }
        sqls.unshift(createTableSql);

        if (model.options.comment) {
            sqls.push(`COMMENT ON TABLE "${model.options.tableName}" IS '${model.options.comment}';`);
        }

        for (const index of model.options.indexes) {
            let indexName = index.name ? index.name : `${model.options.tableName}_${index.fields.join('_')}`;
            if (index.prefix) {
                indexName = `${index.prefix}${indexName}`;
            }
            sqls.push(`CREATE ${index.unique ? 'UNIQUE' : ''} INDEX ${index.concurrently ? 'CONCURRENTLY' : ''} IF NOT EXISTS "${indexName}" ON "${model.options.tableName}" ${index.using ? 'USING' + index.using : ''} (${index.fields.join(', ')});`);
        }

        return sqls;
    }
}
