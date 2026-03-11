# 使用 Sequelize

tiger-ts 通过 `SequelizeDbFactory` 支持关系型数据库，底层使用 Sequelize ORM，支持 MySQL、PostgreSQL 等。

## 安装依赖

```bash
# MySQL
npm install sequelize mysql2

# PostgreSQL
npm install sequelize pg pg-hstore
```

## 定义数据模型

使用 `@Table` 和 `@Column` 装饰器定义表结构，模型需继承 `DbModel`。

`src/model/user.ts`

```typescript
import { DataTypes } from 'sequelize';
import { DbModel, decorator } from 'tiger-ts';

const { Table, Column } = decorator;

@Table({
    tableName: 'user',
    comment: '用户表',
    indexes: [
        { fields: ['username'], unique: true },
        { fields: ['created_at'] },
    ]
})
export class User extends DbModel {
    @Column('id', { type: DataTypes.STRING(24), primaryKey: true })
    public id: string;

    @Column('username', { type: DataTypes.STRING(50), allowNull: false, comment: '用户名' })
    public username: string;

    @Column('password', { type: DataTypes.STRING(100), allowNull: false })
    public password: string;

    @Column('created_at', { type: DataTypes.BIGINT, defaultValue: 0 })
    public createdAt: number;
}
```

`@Table` 参数说明：

| 参数 | 说明 |
|------|------|
| `tableName` | 表名 |
| `comment` | 表注释 |
| `indexes` | 索引配置数组 |
| `group` | 分组标识，用于 `sync()` 时按组同步 |
| `partitionBy` | 可选，分区配置（仅 PostgreSQL） |

`@Column` 参数说明：

| 参数 | 说明 |
|------|------|
| 第一个参数 | 数据库列名 |
| 第二个参数 | Sequelize 列选项，支持 `type`、`allowNull`、`defaultValue`、`comment`、`primaryKey` 等 |

## 初始化 SequelizeDbFactory

`src/service/ioc/index.ts`

```typescript
import { DbFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

// 在 initIoC 函数中添加：
const dbFactory = new service.SequelizeDbFactory(
    {
        dialect: 'mysql',
        host: 'localhost',
        port: 3306,
        database: 'my-db',
        username: 'root',
        password: 'password',
        logging: false,
    },
    async (srvNo) => ({
        dialect: 'mysql',
        host: `shard-${srvNo}`,
        port: 3306,
        database: 'my-db',
        username: 'root',
        password: 'password',
    })
);
Container.set(DbFactoryBase, dbFactory);
```

`SequelizeDbFactory` 构造参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `option` | `Options` | 主库 Sequelize 连接选项 |
| `getClientFunction` | `(srvNo: number) => Promise<Options>` | 多分片时获取连接选项的函数 |

## 基本 CRUD

```typescript
import { DbFactoryBase, IApi, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';
import { User } from '../model/user';

const { Api } = decorator;

@Api({ route: '/user/create', method: 'POST' })
@Service()
export class CreateUserApi implements IApi {

    @Inject()
    public dbFactory: DbFactoryBase;

    public async call(ctx: RouterContext) {
        const repo = this.dbFactory.build({ model: User });

        // 新增
        const user = new User();
        user.id = 'some-id';
        user.username = 'alice';
        user.password = 'hashed-password';
        user.createdAt = Date.now();
        await repo.add(user);

        // 批量新增
        await repo.bulkAdd([user1, user2, user3]);

        // 查询单条
        const found = await repo.findOne({ where: { username: 'alice' } });

        // 查询多条
        const list = await repo.findAll({
            where: { createdAt: { [Op.gt]: 0 } },
            order: [{ field: 'created_at', direction: 'desc' }],
            skip: 0,
            take: 10,
        });

        // 统计
        const total = await repo.count({ username: 'alice' });

        // 更新（整体替换）
        found.password = 'new-password';
        await repo.save(found);

        // 局部更新
        await repo.updateByID(found.id, {
            password: 'new-password',
        });

        // 按条件删除
        await repo.remove({ username: 'alice' });

        // 按 id 删除
        await repo.removeById(found.id);

        return 'ok';
    }
}
```

与 MongoDB 的 `updateByID` 不同，Sequelize 的局部更新直接传字段键值对，不需要 `$set` 等操作符。

## 事务（工作单元）

```typescript
const uow = this.dbFactory.uow();

const userRepo = this.dbFactory.build({ model: User, uow });
const logRepo = this.dbFactory.build({ model: Log, uow });

await userRepo.save(user);
await logRepo.add(log);

// 所有操作在同一个 Sequelize 事务中提交
await uow.commit();
```

## 同步表结构

应用启动时调用 `sync()` 自动建表或更新表结构。

```typescript
const repo = dbFactory.build({ model: User });

// 同步（等同于 Sequelize 的 sync({ alter: true })）
await repo.sync({ alter: true });

// 按分组同步
await repo.sync({ group: 'user', alter: true });
```

## PostgreSQL 分区表

`@Table` 支持 `partitionBy` 配置，`sync()` 时会生成分区表 DDL（仅 PostgreSQL）。

```typescript
import { DataTypes } from 'sequelize';
import { DbModel, decorator } from 'tiger-ts';

const { Table, Column } = decorator;

@Table({
    tableName: 'order',
    comment: '订单表',
    partitionBy: {
        type: 'RANGE',   // RANGE 或 HASH
        field: 'created_at',
    },
    indexes: [
        { fields: ['user_id', 'created_at'] },
    ]
})
export class Order extends DbModel {
    @Column('id', { type: DataTypes.BIGINT, primaryKey: true, autoIncrementIdentity: true })
    public id: number;

    @Column('user_id', { type: DataTypes.STRING(24), allowNull: false })
    public userId: string;

    @Column('created_at', { type: DataTypes.BIGINT, allowNull: false })
    public createdAt: number;
}
```

调用 `sync()` 时会执行 `CREATE TABLE IF NOT EXISTS ... PARTITION BY RANGE (created_at)` 并创建索引。

## 多分片

`srvNo` 参数用于指定分片编号。`srvNo > 0` 时，表名会自动加上后缀 `_${srvNo}`，连接也会通过 `getClientFunction` 获取。

```typescript
// 操作分片 1 的数据，实际表名为 user_1
const repo = this.dbFactory.build({ model: User, srvNo: 1 });
await repo.findAll({ where: { username: 'alice' } });
```
