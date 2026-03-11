# 解析器

`ParserFactory` 提供统一的数据解析接口，通过类型字符串获取对应的解析器，将原始数据转换为目标类型。

## 初始化

```typescript
import { EnumFactoryBase, ParserFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const enumFactory = Container.get(EnumFactoryBase);

const parserFactory = new service.ParserFactory({
    'number': new service.NumberParser(),
    'string': new service.StringParser(),
    'bool': new service.BoolParser(),
    'json': new service.JsonParser(),
    'Value': new service.ValueParser(enumFactory),
    'Reward': new service.RewardParser(enumFactory),
    'Condition': new service.ConditionParser(enumFactory),
    'EnumValue': new service.EnumValueParser(enumFactory),
});
Container.set(ParserFactoryBase, parserFactory);
```

## 使用

```typescript
import { ParserFactoryBase } from 'tiger-ts';
import { Inject, Service } from 'typedi';

@Service()
export class SomeService {

    @Inject()
    public parserFactory: ParserFactoryBase;

    public parse() {
        const num = this.parserFactory.build<number>('number').parse('42');   // 42
        const str = this.parserFactory.build<string>('string').parse(123);    // '123'
        const bool = this.parserFactory.build<boolean>('bool').parse(1);      // true
    }
}
```

---

## 内置解析器

### NumberParser

将数据转换为 `number`。

| 输入类型 | 行为 |
|---------|------|
| `null` | 返回 `null` |
| `number` | 原样返回 |
| `string` | 转换为数字，无效时抛出异常 |
| 其他 | 抛出异常 |

```typescript
parser.parse(42)      // 42
parser.parse('3.14')  // 3.14
parser.parse(null)    // null
```

### StringParser

将数据转换为 `string`。

| 输入类型 | 行为 |
|---------|------|
| `null` | 返回 `null` |
| `string` | 原样返回 |
| `number` | 转为字符串 |
| `object` | `JSON.stringify` |
| 其他 | 抛出异常 |

```typescript
parser.parse('hello')       // 'hello'
parser.parse(42)            // '42'
parser.parse({ a: 1 })     // '{"a":1}'
```

### BoolParser

将数据转换为 `boolean`。

```typescript
parser.parse(true)   // true
parser.parse(1)      // true
parser.parse(0)      // false
parser.parse(null)   // null
```

### JsonParser

将数据转换为对象。

| 输入类型 | 行为 |
|---------|------|
| `null` | 返回 `null` |
| `object` | 原样返回 |
| `string` | `JSON.parse` |
| 其他 | 抛出异常 |

```typescript
parser.parse('{"a":1}')  // { a: 1 }
parser.parse({ a: 1 })   // { a: 1 }
```

---

## 数值相关解析器

以下解析器依赖 `EnumFactory`，通过 `ValueTypeData` 的 `text` 字段将文本映射为 `valueType` 数值。

### ValueParser

将多行文本解析为 `Value[]`，格式为 `数值名称*数量`，每行一条。

```typescript
const values = parser.parse(`金币*100\n钻石*-50`);
// [
//   { valueType: 1, count: 100 },
//   { valueType: 2, count: -50 },
// ]
```

### RewardParser

将多行文本解析为 `Reward[][]`，格式为 `数值名称*数量*权重`，空行分隔不同奖励组。

```typescript
const rewards = parser.parse(`金币*100*1\n钻石*10*2\n\n金币*50*1`);
// [
//   [
//     { valueType: 1, count: 100, weight: 1 },
//     { valueType: 2, count: 10, weight: 2 },
//   ],
//   [
//     { valueType: 1, count: 50, weight: 1 },
//   ]
// ]
```

### ConditionParser

将多行文本解析为 `Condition[][]`，格式为 `数值名称操作符数量`，空行分隔不同条件组（组间为"或"关系，组内为"与"关系）。

支持的操作符：`=`、`>`、`>=`、`<`、`<=`、`!=`

```typescript
const conditions = parser.parse(`金币>=100\n钻石>=10\n\n金币>=1000`);
// [
//   [
//     { valueType: 1, count: 100, op: '>=' },
//     { valueType: 2, count: 10, op: '>=' },
//   ],
//   [
//     { valueType: 1, count: 1000, op: '>=' },
//   ]
// ]
```

### EnumValueParser

将数值名称文本解析为对应的 `valueType` 数值。

```typescript
const valueType = parser.parse('金币');  // 1
```

---

## 自定义解析器

实现 `IParser<T>` 接口即可注册自定义解析器：

```typescript
import { IParser } from 'tiger-ts';

class DateParser implements IParser<Date> {
    public parse(data: any): Date {
        if (data == null) return null;
        return new Date(data);
    }
}

const parserFactory = new service.ParserFactory({
    // ...其他解析器
    'date': new DateParser(),
});
```
