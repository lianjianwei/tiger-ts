# API 定义

tiger-ts 使用 `@Api` 装饰器定义路由，基于 Koa 和 `@koa/router` 实现。

## 基本用法

```typescript
import { IApi, decorator, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/hello', method: 'POST' })
@Service()
export class HelloApi implements IApi {
    public async call(ctx: RouterContext) {
        return 'hello';
    }
}
```

`@Api` 必须与 `@Service()` 配合使用，由 TypeDI 管理实例。

## @Api 参数说明

```typescript
@Api({
    route: '/user/info',
    method: 'GET',
    validateType: UserInfoQuery,
    origin: false,
    middlewares: [AuthMiddleware],
})
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `route` | `string` | 必填 | 路由路径 |
| `method` | `HttpMethod` | `'POST'` | HTTP 方法，支持 `GET` `POST` `PUT` `DELETE` `ALL` `HEAD` `OPTIONS` |
| `validateType` | `Type<any>` | — | 请求体验证类，使用 class-validator 自动校验 |
| `origin` | `boolean` | `false` | 为 `true` 时直接返回 `call()` 的结果，不包装 `{ err, data }` |
| `middlewares` | `Type<IApiMiddleware>[]` | — | 中间件列表，按顺序执行 |

## 请求体验证

通过 `validateType` 指定验证类，框架会在调用 `call()` 前自动用 class-validator 校验请求体，校验失败直接返回错误响应。

```typescript
import { IsNotEmpty, IsInt, Min, Length } from 'class-validator';
import { IApi, decorator, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

class CreateUserBody {
    @Length(2, 20)
    public username: string;

    @IsNotEmpty()
    public password: string;

    @IsInt()
    @Min(0)
    public age: number;
}

@Api({ route: '/user/create', method: 'POST', validateType: CreateUserBody })
@Service()
export class CreateUserApi implements IApi {
    public async call(ctx: RouterContext<CreateUserBody>) {
        const { username, age } = ctx.request.body;
        return { username, age };
    }
}
```

## 响应格式

默认响应格式（`origin: false`）：

```json
{ "err": 0, "data": <返回值> }
```

原始响应（`origin: true`）：

```typescript
@Api({ route: '/health', method: 'GET', origin: true })
@Service()
export class HealthApi implements IApi {
    public async call(ctx: RouterContext) {
        ctx.body = 'ok';  // 直接操作 ctx.body
    }
}
```

## 中间件

实现 `IApiMiddleware` 接口，可在 API 执行前做鉴权、限流等处理。

```typescript
import { IApiMiddleware, ApiOption, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';
import Koa from 'koa';

@Service()
export class AuthMiddleware implements IApiMiddleware {
    public async use(ctx: RouterContext, next: Koa.Next, apiOption: ApiOption) {
        const token = ctx.request.header['authorization'];
        if (!token) {
            ctx.body = { err: 401, errMsg: 'unauthorized' };
            return;
        }
        await next();
    }
}
```

注册到 API：

```typescript
@Api({ route: '/user/profile', method: 'GET', middlewares: [AuthMiddleware] })
@Service()
export class UserProfileApi implements IApi {
    public async call(ctx: RouterContext) {
        return { userId: '123' };
    }
}
```

多个中间件按数组顺序依次执行。

## 文件上传

`ctx.request.files` 包含上传的文件，需配合 `koaBodyOption` 开启文件解析。

```typescript
@Api({ route: '/upload', method: 'POST' })
@Service()
export class UploadApi implements IApi {
    public async call(ctx: RouterContext) {
        const files = ctx.request.files;
        const file = files?.['file'];
        return { received: true };
    }
}
```

## 注册 API

所有 API 文件必须在应用入口 import，以触发 `@Api` 装饰器注册：

```typescript
// src/index.ts
import 'reflect-metadata';
import './api/user';    // 触发装饰器注册
import './api/order';
```

## Koa 中间件配置

通过 `KoaApplication` 组合中间件启动服务：

```typescript
import { LogFactoryBase, service } from 'tiger-ts';
import Container from 'typedi';

const logFactory = Container.get(LogFactoryBase);
const apiFactory = new service.ApiFactory();

new service.KoaApplication([
    service.koaCorsOption(),                          // CORS
    service.koaCompressOption(),                      // 响应压缩
    service.koaBodyOption(),                          // 请求体解析
    service.koaLogOption({ logFactory }),             // 请求日志
    service.koaRouteCheckHeaderOption({               // 请求头校验（可选）
        includePath: '/internal',
        headerKey: 'x-token',
        value: 'secret',
    }),
    service.koaRouteOption(apiFactory),               // 路由注册
], logFactory).listen(3000);
```

中间件说明：

| 函数 | 说明 |
|------|------|
| `koaCorsOption(options?)` | 跨域配置，基于 `@koa/cors` |
| `koaCompressOption(options?)` | 响应压缩，基于 `koa-compress` |
| `koaBodyOption(options?)` | 请求体解析，基于 `koa-body`，支持 JSON、表单、文件上传 |
| `koaLogOption({ logFactory, timeout? })` | 请求日志中间件，自动记录请求和响应，超时标记 |
| `koaRouteCheckHeaderOption(option)` | 对指定路径校验请求头，用于内部接口鉴权 |
| `koaRouteOption(apiFactory, routerOptions?)` | 注册所有 `@Api` 路由 |
| `koaApiCollectionOption(option, redis)` | API 调用量统计，数据存入 Redis |

## API 调用量统计

`koaApiCollectionOption` 中间件将每个接口的调用次数按时间粒度统计到 Redis。

```typescript
import Redis from 'ioredis';

const statisticsRedis = new Redis({ host: 'localhost', port: 6379 });

new service.KoaApplication([
    service.koaBodyOption(),
    service.koaApiCollectionOption({
        name: 'my-app',          // 可选，key 前缀标识
        expire: 600,             // Redis key 过期时间（秒），默认 600
        timeGranularity: 300,    // 时间粒度（秒），默认 300
        excludePaths: ['/health'], // 排除的路径
        prefix: 'api',           // Redis key 前缀，默认 'api'
    }, statisticsRedis),
    service.koaRouteOption(apiFactory),
], logFactory).listen(3000);
```

Redis 中的 key 格式为 `{prefix}:{时间戳}:{name}:{route}`，value 为 hash，field 为请求头中的 `appid`。

## 流式输出（SSE）

适用于 AI 对话等需要逐步推送数据的场景。在 `@Api` 中设置 `stream: true`，`call()` 返回 `Readable` 或 `AsyncIterable`，框架会自动设置 SSE 响应头并将流写入响应。

```typescript
import { Readable } from 'stream';
import { IApi, decorator, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/chat', method: 'POST', stream: true })
@Service()
export class ChatApi implements IApi {
    public async call(ctx: RouterContext): Promise<Readable> {
        const readable = new Readable({ read() {} });

        // 模拟逐字推送
        const words = ['Hello', ' ', 'world', '!'];
        let i = 0;
        const timer = setInterval(() => {
            if (i < words.length) {
                readable.push(words[i++]);
            } else {
                readable.push(null); // 结束流
                clearInterval(timer);
            }
        }, 100);

        return readable;
    }
}
```

框架自动设置的响应头：

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 业务层记录流摘要

流式响应无法在框架层记录响应内容，推荐在业务层将摘要写入 `ctx.state`，日志中间件会在流结束后读取并记录：

```typescript
@Api({ route: '/chat', method: 'POST', stream: true })
@Service()
export class ChatApi implements IApi {
    public async call(ctx: RouterContext): Promise<Readable> {
        // 在 ctx.state 上挂载摘要对象
        const summary = { tokens: 0, model: 'gpt-4o' };
        ctx.state.streamSummary = summary;

        const stream = aiClient.stream(ctx.request.body.prompt);
        stream.on('data', () => summary.tokens++);

        return stream;
    }
}
```

日志中间件读取 `ctx.state.streamSummary`（需自行扩展 `koaLogOption` 的 `end` 回调）。
