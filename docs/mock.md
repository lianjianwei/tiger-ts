# 单元测试 Mock 使用指南

tiger-ts 内置了一个轻量级 Mock 工具（`src/service/mock/index.ts`），用于在单元测试中模拟接口依赖，无需引入第三方 mock 库。

## 基本概念

```typescript
import { Mock, mockAny } from '../mock';
```

`Mock<T>` 基于 `Proxy` 实现，核心能力：

- **属性注入**：构造时传入对象，其属性可直接通过 `.actual` 访问
- **方法期望**：用 `exceptReturn` 预设方法调用的入参和返回值
- **入参校验**：调用方法时自动断言实际参数与预设参数一致
- **顺序消费**：多次预设同一方法时，调用按注册顺序依次消费

---

## API

### `new Mock<T>(target?)`

`target` 是可选的初始属性对象，适合注入接口的**属性字段**（非方法）。

```typescript
const mock = new Mock<IValueService>({
    ownValue: { 1: 100, 2: 50 }
});
```

### `.actual`

返回代理对象，类型为 `T`，传给被测代码使用。

```typescript
const service = mock.actual; // 类型为 IValueService
```

### `.exceptReturn(action, returnValue)`

预设一次方法调用的**入参**和**返回值**。

- `action`：用箭头函数描述调用哪个方法及其预期参数
- `returnValue`：该次调用的返回值（方法是 async 时直接传值，不需要包 `Promise`）

```typescript
mockValueService.exceptReturn(
    r => r.getCount(100),  // 预期调用 getCount(100)
    42                     // 返回 42
);
```

### `mockAny`

通配符，用于忽略某个参数的具体值。

```typescript
mockValueService.exceptReturn(
    r => r.updateOne({ valueType: mockAny, count: mockAny }),
    undefined
);
```

---

## 完整示例

以下示例来自 `reset-value-handler.test.ts`，演示了如何组合使用 Mock 测试一个依赖枚举配置和数值服务的处理器。

### 1. 模拟接口属性

`ownValue` 是 `IValueService` 的属性（非方法），直接在构造参数中传入：

```typescript
const ownValue = { 1: 10 };
const mockValueService = new Mock<IValueService>({ ownValue });

// 被测代码通过 ctx.valueService.ownValue 访问时，拿到的是上面的对象
// 测试结束后可直接断言 ownValue 的变化
strictEqual(ownValue[1], 7);
```

### 2. 模拟方法调用与返回值

```typescript
const mockValueService = new Mock<IValueService>({ ownValue: {} });

// 预设：调用 getCount(100) 时返回昨天的时间戳
mockValueService.exceptReturn(r => r.getCount(100), PAST);

// 预设：调用 updateOne({ valueType: 100, count: NOW }) 时返回 undefined
mockValueService.exceptReturn(r => r.updateOne({ valueType: 100, count: NOW }), undefined);
```

调用方法时，Mock 会：
1. 校验实际参数与预设参数是否一致（用 `deepStrictEqual`），不一致则抛出断言错误
2. 按注册顺序消费并返回对应的返回值

### 3. 模拟嵌套依赖（工厂模式）

当被测代码通过工厂获取另一个对象时，分两层 Mock：

```typescript
const mockEnumFactory = new Mock<EnumFactoryBase>();

// IEnum 本身也是一个接口，其 allItem 是属性（Promise），直接注入
const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>({
    allItem: Promise.resolve({
        1: { value: 1, reset: { timeValueType: 100, timeGranularity: 'day', fixed: 5 } }
    })
});

// 预设：工厂调用 build(...) 时返回 mockEnum
mockEnumFactory.exceptReturn(
    r => r.build({ typer: enum_.ValueTypeData, srvNo: 0 }),
    mockEnum.actual
);
```

### 4. 同一方法多次调用

多次调用 `exceptReturn` 可以为同一方法预设不同次调用的返回值，按注册顺序消费：

```typescript
// 第一次调用 getCount(100) 返回 PAST，第二次返回 NOW
mockValueService.exceptReturn(r => r.getCount(100), PAST);
mockValueService.exceptReturn(r => r.getCount(100), NOW);
```

---

## 错误场景说明

| 场景 | 行为 |
|------|------|
| 调用了未预设的方法 | 抛出 `Error: {methodName}未被调用` |
| 实际参数与预设参数不一致 | 抛出 `AssertionError`（来自 `deepStrictEqual`） |
| 预设的调用次数不足（方法调用次数超出预设） | 抛出错误（returnValues 为空时取 `undefined`，args 校验失败） |

> **提示**：如果测试结束后某个预设方法没有被消费（调用次数少于预设次数），Mock 不会主动报错。如需验证调用次数，可在测试中额外断言业务副作用。

---

## 常见测试结构

```typescript
import { strictEqual } from 'assert';
import { SomeHandler as Self } from './some-handler';
import { Mock } from '../mock';
import { EnumFactoryBase, IEnum, IValueService } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/value/some-handler.ts', () => {
    describe('.someMethod(ctx)', () => {
        it('描述场景', async () => {
            // 1. 准备 Mock 依赖
            const mockEnumFactory = new Mock<EnumFactoryBase>();
            const mockEnum = new Mock<IEnum<enum_.ValueTypeData>>({
                allItem: Promise.resolve({ /* 枚举数据 */ })
            });
            mockEnumFactory.exceptReturn(
                r => r.build({ typer: enum_.ValueTypeData, srvNo: 0 }),
                mockEnum.actual
            );

            // 2. 创建被测对象
            const self = new Self(mockEnumFactory.actual, 0);

            // 3. 准备上下文
            const ownValue = { 1: 0 };
            const mockValueService = new Mock<IValueService>({ ownValue });
            mockValueService.exceptReturn(r => r.getCount(100), 999);

            // 4. 执行
            await self.someMethod({
                value: { valueType: 1, count: 5 },
                valueService: mockValueService.actual
            });

            // 5. 断言
            strictEqual(ownValue[1], 5);
        });
    });
});
```
