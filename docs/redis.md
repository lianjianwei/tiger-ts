# Redis

tiger-ts 提供两个 Redis 功能模块：分布式锁（`RedisMutex`）和发布订阅（`RedisPubSub`）。

## 安装依赖

```bash
npm install ioredis
```

## 分布式锁

### 初始化

在 IoC 初始化时注册 `MutexBase`。

`src/service/ioc/index.ts`

```typescript
import Redis from 'ioredis';
import { MutexBase, ThreadBase, service } from 'tiger-ts';
import { Container } from 'typedi';

// 在 initIoC 函数中添加：
const redis = new Redis({ host: 'localhost', port: 6379 });
const thread = Container.get(ThreadBase);
const mutex = new service.RedisMutex(redis, thread);
Container.set(MutexBase, mutex);
```

### 尝试加锁（lock）

`lock()` 尝试获取锁，成功返回解锁函数，失败返回 `null`。

```typescript
import { IApi, MutexBase, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/order/create', method: 'POST' })
@Service()
export class CreateOrderApi implements IApi {

    @Inject()
    public mutex: MutexBase;

    public async call(ctx: RouterContext) {
        const unlock = await this.mutex.lock({
            key: `order:create:${ctx.request.body.userId}`,
            timeoutSeconds: 10,  // 锁超时时间，默认 10 秒
        });

        if (!unlock) {
            return { err: 1, message: '操作频繁，请稍后再试' };
        }

        try {
            // 执行业务逻辑
            return 'ok';
        } finally {
            await unlock();
        }
    }
}
```

### 等待加锁（waitLock）

`waitLock()` 会轮询等待直到获取锁或超过重试次数，适合需要排队执行的场景。

```typescript
const unlock = await this.mutex.waitLock({
    key: 'resource:update',
    timeoutSeconds: 10,    // 锁超时时间，默认 10 秒
    tryCount: 50,          // 最大重试次数，默认 50
    sleepRange: [50, 100], // 每次重试等待的随机毫秒范围，默认 [50, 100]
});

if (!unlock) {
    throw new Error('获取锁超时');
}

try {
    // 执行业务逻辑
} finally {
    await unlock();
}
```

`MutexOption` 参数说明：

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `key` | 必填 | 锁的 Redis key |
| `timeoutSeconds` | `10` | 锁的自动过期时间（秒），防止死锁 |
| `tryCount` | `50` | `waitLock` 最大重试次数 |
| `sleepRange` | `[50, 100]` | `waitLock` 每次重试的随机等待范围（毫秒） |

---

## 发布订阅

### 初始化

```typescript
import Redis from 'ioredis';
import { LogFactoryBase, PubSubBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const logFactory = Container.get(LogFactoryBase);
const pubSub = new service.RedisPubSub(
    { host: 'localhost', port: 6379 },
    logFactory
);
Container.set(PubSubBase, pubSub);
```

`RedisPubSub` 内部会创建两个独立的 Redis 连接，一个用于订阅，一个用于发布。

### 订阅

```typescript
import { ISubscribe, PubSubBase } from 'tiger-ts';
import { Inject, Service } from 'typedi';

interface OrderMessage {
    orderId: string;
    userId: string;
}

const orderCreatedSubscribe: ISubscribe<OrderMessage> = {
    name: 'orderCreatedHandler',
    async callback(message) {
        console.log('收到订单消息:', message.orderId);
    }
};

// 订阅频道
await pubSub.subscribe('order:created', orderCreatedSubscribe);
```

`ISubscribe` 接口说明：

| 字段 | 说明 |
|------|------|
| `name` | 订阅者名称，用于日志标识 |
| `callback` | 收到消息时的处理函数，接收反序列化后的数据 |

### 发布

```typescript
await pubSub.publish('order:created', {
    orderId: 'order-123',
    userId: 'user-456',
});
```

消息会被 `JSON.stringify` 序列化后发送，订阅方收到后自动 `JSON.parse`。

### 取消订阅

```typescript
await pubSub.unsubscribe('order:created', orderCreatedSubscribe);
```

当一个频道的所有订阅者都被移除后，会自动取消对该频道的 Redis 订阅。

### 关闭连接

```typescript
await pubSub.close();
```
