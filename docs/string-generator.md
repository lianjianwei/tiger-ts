# 字符串生成器

tiger-ts 提供多种字符串生成器，统一继承 `StringGeneratorBase`，通过 `generator()` 方法生成字符串 ID。

## 可用生成器

| 类 | 长度 | 有序 | 说明 |
|---|---|---|---|
| `MongoStringGenerator` | 24 位 | 是 | MongoDB ObjectId 十六进制字符串 |
| `UuidV7StringGenerator` | 36 位 | 是 | UUID v7，时间有序 |
| `UuidV4StringGenerator` | 36 位 | 否 | UUID v4，随机 |
| `NanoidGenerator` | 自定义 | 否 | 基于 nanoid，支持自定义字符集和长度 |

## 初始化

在 IoC 初始化时注册到容器：

```typescript
import { StringGeneratorBase, service } from 'tiger-ts';
import { Container } from 'typedi';

// 选择一种注册
Container.set(StringGeneratorBase, new service.MongoStringGenerator());
// 或
Container.set(StringGeneratorBase, new service.UuidV7StringGenerator());
// 或
Container.set(StringGeneratorBase, new service.UuidV4StringGenerator());
// 或
Container.set(StringGeneratorBase, new service.NanoidGenerator());
```

## 使用

```typescript
import { IApi, StringGeneratorBase, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/user/create', method: 'POST' })
@Service()
export class CreateUserApi implements IApi {

    @Inject()
    public stringGenerator: StringGeneratorBase;

    public async call(ctx: RouterContext) {
        const id = this.stringGenerator.generator();
        // 用于新建记录的 id
        return { id };
    }
}
```

## 各生成器说明

### MongoStringGenerator

生成 24 位有序十六进制字符串，基于 MongoDB `ObjectId`，适合 MongoDB 主键。

```typescript
const gen = new service.MongoStringGenerator();
gen.generator(); // 'a1b2c3d4e5f6a1b2c3d4e5f6'
```

### UuidV7StringGenerator

生成 36 位有序 UUID v7，格式为 `8-4-4-4-12`，时间戳前缀保证有序性，适合需要排序的场景。

```typescript
const gen = new service.UuidV7StringGenerator();
gen.generator(); // '019584a2-1234-7xxx-yxxx-xxxxxxxxxxxx'
```

### UuidV4StringGenerator

生成 36 位随机 UUID v4，格式为 `8-4-4-4-12`。

```typescript
const gen = new service.UuidV4StringGenerator();
gen.generator(); // 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

### NanoidGenerator

基于 [nanoid](https://github.com/ai/nanoid)，支持自定义字符集和默认长度。

```typescript
// 默认：21 位，使用 nanoid 默认字符集
const gen1 = new service.NanoidGenerator();
gen1.generator();      // 'V1StGXR8_Z5jdHi6B-myT'
gen1.generator(10);    // 指定长度 10 位

// 自定义字符集（只含数字）
const gen2 = new service.NanoidGenerator('0123456789', 16);
gen2.generator();      // '4891023847561029'
```

`NanoidGenerator` 构造参数：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `alphabet` | `''` | 自定义字符集，为空时使用 nanoid 默认字符集 |
| `defaultSize` | `21` | 默认生成长度 |
