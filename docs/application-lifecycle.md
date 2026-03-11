# 应用生命周期

tiger-ts 提供三个装饰器用于在应用启动和关闭时执行自定义逻辑。

## 装饰器说明

| 装饰器 | 触发时机 |
|--------|---------|
| `@ApplicationBeforeEvent()` | 应用启动前（中间件注册前） |
| `@ApplicationAfterEvent()` | 应用启动后（开始监听端口后） |
| `@ApplicationClose()` | 应用关闭时 |

## 启动前事件（ApplicationBeforeEvent）

适合在服务启动前做初始化工作，如同步数据库表结构、预热缓存等。

```typescript
import { decorator } from 'tiger-ts';
import { Service } from 'typedi';

const { ApplicationBeforeEvent } = decorator;

@ApplicationBeforeEvent()
@Service()
export class SyncDbEvent {
    public name = 'SyncDbEvent';

    public async call() {
        // 同步数据库表结构
        console.log('同步数据库...');
    }
}
```

实现接口 `IApplicationEvent`，需要提供：
- `name` — 事件名称，用于日志标识
- `call()` — 事件处理函数

## 启动后事件（ApplicationAfterEvent）

适合在服务开始接受请求后执行，如注册服务发现、启动定时任务等。

```typescript
import { decorator } from 'tiger-ts';
import { Service } from 'typedi';

const { ApplicationAfterEvent } = decorator;

@ApplicationAfterEvent()
@Service()
export class RegisterServiceEvent {
    public name = 'RegisterServiceEvent';

    public async call() {
        // 注册到服务发现中心
        console.log('服务已启动，注册服务...');
    }
}
```

## 关闭事件（ApplicationClose）

适合在应用关闭时释放资源，如关闭数据库连接、断开 Redis 等。

```typescript
import { DbFactoryBase, decorator } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { ApplicationClose } = decorator;

@ApplicationClose()
@Service()
export class CloseDbEvent {

    @Inject()
    public dbFactory: DbFactoryBase;

    public async close(force?: boolean) {
        await this.dbFactory.close(0);
        console.log('数据库连接已关闭');
    }
}
```

实现接口 `IApplicationClose`，需要提供：
- `close(force?: boolean)` — 关闭处理函数，`force` 表示是否强制关闭

## 注册事件

事件类需要在应用入口文件中 import，以触发装饰器注册：

`src/index.ts`

```typescript
import 'reflect-metadata';
import './api';
import './event/sync-db';       // 触发 @ApplicationBeforeEvent 注册
import './event/register';      // 触发 @ApplicationAfterEvent 注册
import './event/close-db';      // 触发 @ApplicationClose 注册

import { LogFactoryBase, service } from 'tiger-ts';
import Container from 'typedi';
import { initIoC } from './service/ioc';

(async () => {
    const cfg = await initIoC();
    const logFactory = Container.get(LogFactoryBase);

    const app = new service.KoaApplication(
        [
            service.koaBodyOption(),
            service.koaRouteOption(new service.ApiFactory()),
        ],
        logFactory
    );

    await app.listen(cfg.port);
})();
```

## 执行顺序

```
1. ApplicationBeforeEvent（按注册顺序依次执行）
2. 注册 Koa 中间件
3. 开始监听端口
4. ApplicationAfterEvent（按注册顺序依次执行）

关闭时：
5. ApplicationClose（按注册顺序依次执行）
```

每个事件执行时会自动打印 debug 日志，记录事件名称和耗时。
