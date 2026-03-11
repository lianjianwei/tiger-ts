# 数值服务

`ValueService` 是一个通用的数值管理系统，适合游戏或业务场景中对用户资源（金币、经验、体力等）的读写、条件检查和变更追踪。

## 核心概念

- `Value` — 数值格式：`{ valueType: number, count: number }`
- `Condition` — 条件格式：`Value & { op: '=' | '>' | '>=' | '<' | '<=' | '!=' }`
- `ValueService` — 数值服务，操作 `ownValue`（一个 `{ [valueType]: count }` 对象）
- `ValueHandlerBase` — 数值处理器，责任链模式，拦截读写操作

## 基本用法

```typescript
import { service } from 'tiger-ts';

// ownValue 通常来自数据库，是用户的资源数据
const ownValue = { 1: 100, 2: 50 };  // valueType 1: 金币=100, valueType 2: 钻石=50

const valueService = new service.ValueService(ownValue);

// 读取数值
const gold = await valueService.getCount(1);  // 100

// 更新数值（累加）
await valueService.update([
    { valueType: 1, count: -10 },  // 扣除 10 金币
    { valueType: 2, count: 5 },    // 增加 5 钻石
]);

console.log(ownValue);  // { 1: 90, 2: 55 }
```

## 条件检查

`checkCondition` 支持二维数组条件，外层数组为"或"关系，内层数组为"与"关系。

```typescript
// 检查：金币 >= 100 且 钻石 >= 10
const ok = await valueService.checkCondition([
    [
        { valueType: 1, count: 100, op: '>=' },
        { valueType: 2, count: 10, op: '>=' },
    ]
]);

// 检查：金币 >= 1000 或 钻石 >= 100
const ok2 = await valueService.checkCondition([
    [{ valueType: 1, count: 1000, op: '>=' }],
    [{ valueType: 2, count: 100, op: '>=' }],
]);
```

支持的操作符：`=`、`>`、`>=`、`<`、`<=`、`!=`

## 资源充足检查

`checkEnough` 检查扣除操作是否能满足，`count` 为负数表示扣除。

```typescript
const result = await valueService.checkEnough([
    { valueType: 1, count: -200 },  // 需要扣除 200 金币
    { valueType: 2, count: -30 },   // 需要扣除 30 钻石
]);

if (!result.enough) {
    // result.value 是第一个不足的数值及缺口
    // { valueType: 1, count: -100 }  表示金币还差 100
    return { err: 1, message: '资源不足' };
}

// 足够则执行扣除
await valueService.update([
    { valueType: 1, count: -200 },
    { valueType: 2, count: -30 },
]);
```

## 变更追踪（getDiffValues）

`getDiffValues` 返回自上次调用以来的数值变化，用于记录日志或同步数据库。

```typescript
await valueService.update([{ valueType: 1, count: -10 }]);
await valueService.update([{ valueType: 1, count: 5 }]);

// 获取变化量（不清空）
const diffs = valueService.getDiffValues();
// [{ valueType: 1, count: -5 }]

// 获取变化量并清空
const diffs2 = valueService.getDiffValues(true);
```

---

## 数值处理器

处理器采用责任链模式，通过 `setNext()` 串联，每次读写操作会依次经过所有处理器。

### DefaultValueHandler（默认处理器）

将数值累加到 `ownValue`，是最基础的处理器，通常放在链的末尾。

```typescript
import { service } from 'tiger-ts';

const handler = new service.DefaultValueHandler();
const valueService = new service.ValueService(ownValue, handler);
```

### FilterValueHandler（过滤处理器）

跳过无效更新：普通数值跳过 `count == 0` 的更新；`isReplace` 类型数值跳过与当前值相同的更新。

```typescript
const filter = new service.FilterValueHandler(enumFactory, srvNo);
const defaultHandler = new service.DefaultValueHandler();
filter.setNext(defaultHandler);

const valueService = new service.ValueService(ownValue, filter);
```

### ReplaceValueHandler（覆盖处理器）

对 `isReplace` 类型的数值，先将 `ownValue[valueType]` 置为 0，再由后续处理器累加，实现"覆盖"而非"累加"的效果。

```typescript
const filter = new service.FilterValueHandler(enumFactory, srvNo);
const replace = new service.ReplaceValueHandler(enumFactory, srvNo);
const defaultHandler = new service.DefaultValueHandler();

filter.setNext(replace).setNext(defaultHandler);
```

### NegativeCheckValueHandler（负数检查处理器）

更新后检查数值是否为负数，若为负则抛出异常（`isNegative` 为 true 的数值类型允许为负）。

```typescript
const negativeCheck = new service.NegativeCheckValueHandler(enumFactory, srvNo);
negativeCheck.setNext(new service.DefaultValueHandler());
```

### ResetValueHandler（重置处理器）

按时间粒度（天/周等）自动重置数值，需在 `ValueTypeData` 中配置 `reset` 字段。

```typescript
const reset = new service.ResetValueHandler(enumFactory, srvNo);
reset.setNext(new service.DefaultValueHandler());
```

`ValueTypeData.reset` 配置：

| 字段 | 说明 |
|------|------|
| `timeValueType` | 记录上次重置时间的数值类型 |
| `timeGranularity` | 重置粒度，dayjs 的 `OpUnitType`，如 `'day'`、`'week'` |
| `fixed` | 重置后的固定值 |
| `countValueType` | 重置后从另一个数值类型读取初始值（与 `fixed` 二选一，优先） |

### SyncValueHandler（同步处理器）

更新某个数值时，同步更新其他关联数值类型，需在 `ValueTypeData` 中配置 `sync` 字段。

```typescript
const sync = new service.SyncValueHandler(enumFactory, srvNo);
sync.setNext(new service.DefaultValueHandler());
```

`ValueTypeData.sync` 配置：

| 字段 | 说明 |
|------|------|
| `valueTypes` | 同步更新的数值类型列表（不区分正负） |
| `positiveValueTypes` | 仅在增加时同步的数值类型列表 |
| `negativeValueTypes` | 仅在减少时同步的数值类型列表 |

---

## 完整处理器链示例

```typescript
import { service } from 'tiger-ts';

function buildValueService(ownValue: object, enumFactory, srvNo = 0) {
    const filter = new service.FilterValueHandler(enumFactory, srvNo);
    const replace = new service.ReplaceValueHandler(enumFactory, srvNo);
    const reset = new service.ResetValueHandler(enumFactory, srvNo);
    const sync = new service.SyncValueHandler(enumFactory, srvNo);
    const negativeCheck = new service.NegativeCheckValueHandler(enumFactory, srvNo);
    const defaultHandler = new service.DefaultValueHandler();

    filter.setNext(replace).setNext(reset).setNext(sync).setNext(negativeCheck).setNext(defaultHandler);

    return new service.ValueService(ownValue, filter);
}
```
