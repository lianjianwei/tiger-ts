import { Options, Sequelize } from 'sequelize';

import { SequelizeDbRepository } from './db-repository';
import { SequelizeUnitOfWork } from './unit-of-work';
import { BuilderOption, DbFactoryBase, DbModel, IDbRepository, IUnitOfWork } from '../../contract';
import { COLUMN_METADATA, TABLE_METADATA } from '../../decorator';

export class SequelizeDbFactory extends DbFactoryBase {

    private m_SrvSequelizeClientMap: {
        [srvNo: number]: Promise<Sequelize>;
    } = {};

    private m_UrlSequelizeClientMap: {
        [url: string]: {
            client: Sequelize,
            count: number;
        };
    } = {};

    private m_SrvUrlMap: {
        [srvNo: number]: string;
    } = {};

    public constructor(
        private m_Option: Options,
        private m_GetClientFunction: (srvNo: number) => Promise<Options>
    ) {
        super();
    }

    public getOriginConnection<T>(srvNo = 0) {
        this.m_SrvSequelizeClientMap[srvNo] ??= new Promise<Sequelize>(async (s, f) => {
            try {
                let option = srvNo ? await this.m_GetClientFunction(srvNo) : this.m_Option;
                const key = this.getKey(option);
                this.m_UrlSequelizeClientMap[key] ??= {
                    client: new Sequelize(option),
                    count: 0,
                };
                this.m_SrvUrlMap[srvNo] = key;
                this.m_UrlSequelizeClientMap[key].count++;
                const client = this.m_UrlSequelizeClientMap[key].client;
                await client.authenticate();
                s(client);
            } catch (error) {
                f(error);
            }
        });
        return this.m_SrvSequelizeClientMap[srvNo] as Promise<T>;
    }

    private getKey(options: Options) {
        return `${options.host}:${options.port}/${options.database}`;
    }

    public build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T> {
        return new SequelizeDbRepository<T>(this, opt);
    }

    public uow(): IUnitOfWork {
        return new SequelizeUnitOfWork(this);
    }

    public async close(srvNo: number) {
        if (this.m_SrvSequelizeClientMap[srvNo]) {
            const key = this.m_SrvUrlMap[srvNo];
            delete this.m_SrvSequelizeClientMap[srvNo];
            delete this.m_SrvUrlMap[srvNo];
            const urlSequelizeClient = this.m_UrlSequelizeClientMap[key];
            if (urlSequelizeClient) {
                urlSequelizeClient.count--;
                if (urlSequelizeClient.count <= 0) {
                    await urlSequelizeClient.client.close();
                }
            }
        }
    }

    /**
     * 实际模型名称为 `${name}-${srvNo}` 或 `${name}`，根据服务器编号是否为0来判断。
     * 实际表名为 `${tableName}_${srvNo}` 或 `${tableName}`，根据服务器编号是否为0来判断。
     * 
     * @param name 模型名称
     * @param srvNo 服务器编号
     * @returns 
     */
    public async getModel(name: string, srvNo = 0) {
        const client = await this.getOriginConnection<Sequelize>(srvNo);
        const modelName = srvNo ? `${name}-${srvNo}` : name;
        const model = client.models[modelName];
        if (model)
            return model;

        const columnMetadata = COLUMN_METADATA[name];
        if (!columnMetadata)
            throw new Error(`Model ${name} not defined.`);

        const fields = columnMetadata.reduce((memo, r) => {
            memo[r.columnName] = r.option;
            return memo;
        }, {});

        const tableName = TABLE_METADATA[name]?.options.tableName;
        const actualTableName = srvNo ? `${tableName}_${srvNo}` : tableName;

        return client.define(modelName, fields, {
            timestamps: false,
            underscored: false,
            ...TABLE_METADATA[name]?.options,
            tableName: actualTableName
        });
    }
}
