# 使用 MongoDB

## 安装依赖

```bash
npm install mongodb
```

## 定义数据模型

使用 `@Collection` 装饰器定义集合，模型需继承 `DbModel`。

`src/model/user.ts`

```typescript
import { DbModel, decorator, model } from 'tiger-ts';

const { Collection } = decorator;

@Collection({
    name: 'User',
    comment: '用户表',
    group: model.enum_.MongoCollectionGroup.main,
    indexes: [
        { spec: { username: 1 }, options: { unique: true, background: true } },
        { spec: { createdAt: -1 }, options: { name: 'createAt', background: true } },
    ]
})
export class User extends DbModel {
    public declare id: string;
    public username: string;
    public password: string;
    public createdAt: number;
}
```

`DbModel` 基类提供了 `id` 字段，对应 MongoDB 的 `_id`，集成基类后要标注下当前表的主键类型是 string 还是 number。

`@Collection` 参数说明：

| 参数 | 必须 | 说明 |
|------|-----|------|
| `name` | 是 | 集合名称 |
| `group` | 是 | 分组标识，用于 `sync()` 时按组同步 |
| `comment` | 是 | 集合注释 |
| `indexes` | 否 | 索引配置数组，`spec` 为索引字段，`options` 为 MongoDB 索引选项 |

## 初始化 MongoDbFactory

在 IoC 初始化时注册数据库工厂。

`src/service/ioc/index.ts`

```typescript
import { DbFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

// 在 initIoC 函数中添加：
const dbFactory = new service.MongoDbFactory(
    'mongodb://localhost:27017',  // 主连接 URL
    'my-db',                      // 数据库名
    async (srvNo) => `mongodb://shard-${srvNo}:27017`  // 多分片时获取 URL 的函数
);
Container.set(DbFactoryBase, dbFactory);
```

`MongoDbFactory` 构造参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `url` | `string` | 主 MongoDB 连接 URL |
| `dbName` | `string` | 数据库名 |
| `getMongoUrl` | `(srvNo: number) => Promise<string>` | 多分片时获取连接 URL 的函数 |
| `bulkWriteOptions` | `BulkWriteOptions` | 可选，bulkWrite 选项 |
| `option` | `MongoClientOptions` | 可选，MongoDB 客户端选项 |

## 基本 CRUD

在 API 或 Service 中注入 `DbFactoryBase`，通过 `build()` 获取仓储对象。

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

        // 查询单条
        const found = await repo.findOne({ where: { username: 'alice' } });

        // 查询多条
        const list = await repo.findAll({
            where: { createdAt: { $gt: 0 } },
            order: [{ field: 'createdAt', direction: 'desc' }],
            skip: 0,
            take: 10,
        });

        // 统计
        const total = await repo.count({ username: 'alice' });

        // 更新（整体替换）
        found.password = 'new-password';
        await repo.save(found);

        // 局部更新（MongoDB 原生操作符）
        await repo.updateByID(found.id, {
            $set: { password: 'new-password' },
            $inc: { loginCount: 1 },
        });

        // 按条件删除
        await repo.remove({ username: 'alice' });

        // 按 id 删除
        await repo.removeById(found.id);

        return 'ok';
    }
}
```

`build()` 参数说明：

| 参数 | 说明 |
|------|------|
| `model` | 数据模型类 |
| `srvNo` | 可选，分片编号，默认 0 |
| `uow` | 可选，传入工作单元以开启事务模式 |

`findOne` / `findAll` 的 `QueryOption`：

| 参数 | 说明 |
|------|------|
| `where` | 查询条件，支持 MongoDB 原生查询语法 |
| `order` | 排序，`field` 为字段名，`direction` 为 `asc` / `desc` |
| `skip` | 跳过条数 |
| `take` | 返回条数 |

## 事务（工作单元）

多个操作需要原子提交时，使用 `uow()`。

```typescript
const uow = this.dbFactory.uow();

const userRepo = this.dbFactory.build({ model: User, uow });
const logRepo = this.dbFactory.build({ model: Log, uow });

await userRepo.save(user);
await logRepo.add(log);

// 所有操作一起提交
await uow.commit();

// 提交后执行回调（如发送通知）
uow.registerAfterCommit(async () => {
    await sendNotification(user.id);
});
```

## 同步索引

应用启动时调用 `sync()` 创建集合索引。

```typescript
const repo = dbFactory.build({ model: User });
await repo.sync();

// 按分组同步
await repo.sync({ group: 'user' });
```
