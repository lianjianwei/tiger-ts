# 枚举工厂

`EnumFactory` 提供统一的枚举数据管理，支持从数据库加载、缓存、聚合（reduce）和刷新。

## 核心概念

- `EnumItem` — 枚举数据基类，包含 `value`（数值）和 `text`（文本）字段
- `EnumFactory` — 工厂类，负责构建和缓存枚举实例
- `IEnum` — 枚举实例接口，提供 `allItem`、`items`、`getReduce`、`flush`

## 定义枚举数据类

```typescript
import { EnumItem } from 'tiger-ts';

export class ItemTypeData extends EnumItem {
    public static ctor = 'ItemTypeData';  // 用于 IoC 标识，必须与类名一致

    public name: string;
    public maxStack: number;
    public isConsumable: boolean;
}
```

枚举数据存储在数据库的 `Enum` 集合/表中，结构为：

```json
{
    "id": "ItemTypeData",
    "items": {
        "1": { "value": 1, "text": "金币", "name": "金币", "maxStack": 9999, "isConsumable": true },
        "2": { "value": 2, "text": "钻石", "name": "钻石", "maxStack": 9999, "isConsumable": true }
    }
}
```

## 初始化 EnumFactory

### 配合 MongoDB

```typescript
import { DbFactoryBase, EnumFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const dbFactory = Container.get(DbFactoryBase);

const enumFactory = new service.EnumFactory({
    // 默认加载函数，所有枚举类型共用
    '': service.mongoEnumLoadFunction(dbFactory),
});
Container.set(EnumFactoryBase, enumFactory);
```

### 配合 Sequelize

```typescript
import { DbFactoryBase, EnumFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const dbFactory = Container.get(DbFactoryBase);

const enumFactory = new service.EnumFactory({
    '': service.sequelizeEnumLoadFunction(dbFactory),
});
Container.set(EnumFactoryBase, enumFactory);
```

### 自定义加载函数

不同枚举类型可以使用不同的加载函数：

```typescript
const enumFactory = new service.EnumFactory({
    // 针对特定枚举类型的加载函数
    'ItemTypeData': async (typer, srvNo) => {
        // 自定义加载逻辑，返回 { [value: number]: T }
        return {
            1: { value: 1, text: '金币', name: '金币', maxStack: 9999 },
        };
    },
    // 其余枚举类型使用默认加载函数
    '': service.mongoEnumLoadFunction(dbFactory),
});
```

## 读取枚举数据

```typescript
import { EnumFactoryBase, IApi, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';
import { ItemTypeData } from '../model/enum/item-type';

const { Api } = decorator;

@Api({ route: '/item/list', method: 'POST' })
@Service()
export class ItemListApi implements IApi {

    @Inject()
    public enumFactory: EnumFactoryBase;

    public async call(ctx: RouterContext) {
        const itemEnum = this.enumFactory.build({ typer: ItemTypeData });

        // 获取所有数据（对象格式，key 为 value）
        const allItem = await itemEnum.allItem;
        // { 1: { value: 1, text: '金币', ... }, 2: { ... } }

        // 获取所有数据（数组格式）
        const items = await itemEnum.items;
        // [{ value: 1, text: '金币', ... }, { value: 2, ... }]

        // 按 value 获取单条
        const gold = allItem[1];

        return items;
    }
}
```

`build()` 参数说明：

| 参数 | 说明 |
|------|------|
| `typer` | 枚举数据类，或字符串类名 |
| `srvNo` | 可选，分片编号，默认 0 |

## 聚合（getReduce）

`getReduce` 将枚举数组聚合为自定义结构，适合构建索引或映射表。

```typescript
// 定义聚合结果类型
class ItemTypeByName {
    public static ctor = 'ItemTypeByName';
    [name: string]: ItemTypeData;
}

// 初始化时注册 reduce 函数
const enumFactory = new service.EnumFactory(
    { '': service.mongoEnumLoadFunction(dbFactory) },
    {
        // 枚举类名 -> reduce 函数映射
        'ItemTypeData': {
            'ItemTypeByName': (memo: ItemTypeByName, item: ItemTypeData) => {
                memo[item.name] = item;
                return memo;
            }
        }
    }
);
```

使用时：

```typescript
const itemEnum = this.enumFactory.build({ typer: ItemTypeData });

// 按 name 索引的 map
const byName = await itemEnum.getReduce(ItemTypeByName);
const gold = byName['金币'];  // { value: 1, text: '金币', ... }
```

## 刷新缓存

枚举数据默认在首次访问时从数据库加载并缓存，调用 `flush()` 可清除缓存，下次访问时重新加载。

```typescript
const itemEnum = this.enumFactory.build({ typer: ItemTypeData });
itemEnum.flush();

// 下次访问 allItem / items / getReduce 时会重新从数据库加载
const items = await itemEnum.items;
```
