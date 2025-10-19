import { Type } from './type';

export abstract class DbModel {
    public id: string;
}

export type Action = () => Promise<void> | void;

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
};

export type QueryOption = Partial<{
    where: any;
    skip: number;
    take: number;
    order: string[];
    orderByDesc: string[];
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
     * 数据库删除
     * 
     * @param entry 实例
     */
    remove(entry: T): Promise<void>;

    /**
     * 数据库保存
     * 
     * @param entry 实例
     */
    save(entry: T): Promise<void>;

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
}

/**
 * 数据库工厂
 */
export abstract class DbFactoryBase {
    /**
     * 获取原始数据库连接
     */
    public abstract getOriginConnection<T>(): Promise<T>;

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
}
