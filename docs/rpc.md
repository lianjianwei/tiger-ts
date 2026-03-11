# RPC 与负载均衡

tiger-ts 提供基于 axios 的 RPC 客户端，配合负载均衡策略实现服务间调用。

## 安装依赖

```bash
npm install axios
```

## 负载均衡策略

`LoadBalance` 是一个服务名到 URL 列表的映射：

```typescript
type LoadBalance = {
    [app: string]: string[];
};
```

提供两种内置策略：

| 策略类 | 说明 |
|--------|------|
| `LoadBalanceRoundRobinStrategy` | 轮询，依次选取 URL |
| `LoadBalanceRandomStrategy` | 随机，每次随机选取 URL |

## 初始化

在 IoC 初始化时注册 RPC 客户端：

```typescript
import { RpcBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const loadBalance = {
    'user-service': [
        'http://user-service-1:3000',
        'http://user-service-2:3000',
        'http://user-service-3:3000',
    ],
    'order-service': [
        'http://order-service-1:3001',
    ],
};

// 轮询策略
const strategy = new service.LoadBalanceRoundRobinStrategy(loadBalance);
// 或随机策略
// const strategy = new service.LoadBalanceRandomStrategy(loadBalance);

const rpc = new service.AxiosRpc(strategy, {
    // 可选：默认请求头，每次请求都会携带
    'x-internal-token': 'secret-token',
});
Container.set(RpcBase, rpc);
```

`AxiosRpc` 构造参数：

| 参数 | 说明 |
|------|------|
| `loadBalanceStrategy` | 负载均衡策略实例 |
| `defaultHeaders` | 可选，每次请求携带的默认请求头 |

## 发起 RPC 调用

```typescript
import { IApi, RpcBase, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/order/create', method: 'POST' })
@Service()
export class CreateOrderApi implements IApi {

    @Inject()
    public rpc: RpcBase;

    public async call(ctx: RouterContext) {
        // 调用 user-service 的 /user/info 接口
        const res = await this.rpc.call<{ id: string; username: string }>({
            app: 'user-service',       // 服务名，对应 LoadBalance 的 key
            route: '/user/info',       // 接口路由
            body: { userId: '123' },   // 请求体
            headers: {                 // 可选，额外请求头
                'x-trace-id': 'trace-abc',
            },
            throwError: true,          // 可选，err !== 0 时自动抛出 CustomError
        });

        if (res.err !== 0) {
            return { err: res.err, message: res.errMsg };
        }

        return res.data;
    }
}
```

`RpcOption` 参数说明：

| 参数 | 必填 | 说明 |
|------|------|------|
| `app` | 是 | 服务名，对应 `LoadBalance` 的 key |
| `route` | 是 | 接口路由路径 |
| `body` | 否 | POST 请求体 |
| `headers` | 否 | 额外请求头，会与 `defaultHeaders` 合并 |
| `throwError` | 否 | 为 `true` 时，响应 `err !== 0` 会抛出 `CustomError` |

`RpcResponse<T>` 响应格式：

```typescript
{
    err: number;      // 0 表示成功
    data?: T;         // 成功时的数据
    errMsg?: any;     // 失败时的错误信息
}
```

## 从配置文件加载负载均衡配置

实际项目中，服务地址通常来自配置文件：

`config.yaml`

```yaml
App:
    port: 3000
    name: my-service
    loadBalance:
        user-service:
            - http://user-service-1:3000
            - http://user-service-2:3000
        order-service:
            - http://order-service-1:3001
```

`src/model/config/app.ts`

```typescript
import { LoadBalance } from 'tiger-ts';

export class App {
    public name: string;
    public version: string;
    public port: number;
    public loadBalance: LoadBalance;
}
```

`src/service/ioc/index.ts`

```typescript
const strategy = new service.LoadBalanceRoundRobinStrategy(cfg.loadBalance);
const rpc = new service.AxiosRpc(strategy);
Container.set(RpcBase, rpc);
```

## Koa 中间件：请求日志

`koaLogOption` 中间件自动记录每个请求的路由、请求体、响应和耗时，超时时会额外标记。

```typescript
import { LogFactoryBase, service } from 'tiger-ts';
import Container from 'typedi';

const logFactory = Container.get(LogFactoryBase);

new service.KoaApplication([
    service.koaBodyOption(),
    service.koaLogOption({
        logFactory,
        timeout: 2000,   // 超过 2000ms 标记为超时，默认 2000
    }),
    service.koaRouteOption(new service.ApiFactory()),
], logFactory).listen(3000);
```

## Koa 中间件：请求头校验

`koaRouteCheckHeaderOption` 对指定路径前缀的请求校验特定请求头，适合内部接口鉴权。

```typescript
service.koaRouteCheckHeaderOption({
    includePath: '/internal',        // 匹配包含该字符串的路径
    headerKey: 'x-internal-token',   // 校验的请求头 key
    value: 'secret-token',           // 期望的请求头值
    errMsg: 'access not allowed',    // 可选，校验失败时的错误信息
})
```

校验失败时返回 `{ err: invalidParams, errMsg: 'access not allowed' }`。
