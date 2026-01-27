import { Document, UpdateFilter } from 'mongodb';
import { Model, ModelStatic } from 'sequelize';

import { Type } from './type';

export type IDType = string | number;

export abstract class DbModel {
    public id?: IDType;
}

export type MongoUpdateOption = UpdateFilter<Document>;
export type SequelizeUpdateOption = ModelStatic<Model<any, any>>;
export type UpdateOption = MongoUpdateOption | SequelizeUpdateOption;

export type Action = () => Promise<void> | void;

export type SyncOption = Partial<{
    /**
     * 是否强制更新表结构(DROP TABLE IF EXISTS)
     */
    force: boolean,

    /**
     * 是否允许表结构变更(ALTER TABLE)
     */
    alter: boolean;

    /**
     * 分区
     */
    group: string;
}>;

/**
 * 工作单元
 */
export interface IUnitOfWork {
    /**
     * 注册提交后事件
     * 
     * 这些事件将会在数据库事务提交完成后执行，相同 key 的情况下行为将被后来的行为覆盖
     * key 不传时，应该为事件生成不同的 key
     * 
     * @param action 行为
     * @param key 键
     */
    registerAfterCommit(action: Action, key?: string): void;
    /**
     * 提交
     */
    commit(): Promise<void>;
}

export type BuilderOption<T extends DbModel> = {
    model: Type<T> | string;
    uow?: IUnitOfWork;
    srvNo?: number;
};

export type QueryOption = Partial<{
    where: any;
    skip: number;
    take: number;
    order: { field: string; direction: 'asc' | 'desc'; }[];
}>;

/**
 * 数据仓储对象
 */
export interface IDbRepository<T extends DbModel> {
    /**
     * 数据库添加
     * 
     * @param entry 实例
     */
    add(entry: T): Promise<void>;

    /**
     * 批量添加
     * 
     * @param entries 实例集合
     */
    bulkAdd(entries: T[]): Promise<void>;

    /**
     * 根据条件删除数据
     * 
     * @param where 删除条件
     */
    remove(where: any): Promise<void>;

    /**
     * 根据ID删除数据
     * 
     * @param id 实体ID
     */
    removeById(id: IDType): Promise<void>;

    /**
     * 数据库保存
     * 
     * @param entry 实例
     */
    save(entry: T): Promise<void>;

    /**
     * 数据库更新操作
     * 
     * 可以实现某个字段自增，自增
     * 
     * @param entry 实例
     */
    updateByID(id: IDType, entry: UpdateOption): Promise<void>;

    /**
     * 根据条件查询数量
     * 
     * @param where 条件
     */
    count(where?: any): Promise<number>;

    /**
     * 根据条件查询一条数据（take固定为1）
     * 
     * @param opt 查询条件
     */
    findOne(opt?: QueryOption): Promise<T>;

    /**
     * 根据条件查询数据
     * 
     * @param opt 查询条件
     */
    findAll(opt?: QueryOption): Promise<T[]>;

    /**
     * 同步表结构
     */
    sync(opt?: SyncOption): Promise<void>;

    /**
     * 获得数据库实际表名
     */
    getTableName(): Promise<string>;
}

/**
 * 数据库工厂
 */
export abstract class DbFactoryBase {
    /**
     * 获取原始数据库连接
     * 
     * @param srvNo 服务器编号 默认 0 
     */
    public abstract getOriginConnection<T>(srvNo?: number): Promise<T>;

    /**
     * 构建数据仓储对象
     * 
     * @param opt 构建数据仓储对象所需的参数
     */
    public abstract build<T extends DbModel>(opt: BuilderOption<T>): IDbRepository<T>;

    /**
     * 获取工作单元
     */
    public abstract uow(): IUnitOfWork;

    /**
     * 关闭数据库连接
     * 
     * @param srvNo 服务器编号 默认 0 
     */
    public abstract close(srvNo: number): Promise<void>;
}
