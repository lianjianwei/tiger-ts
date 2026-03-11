# 日志

tiger-ts 提供统一的日志接口 `LogFactoryBase`，支持两种实现：Console 输出和 log4js。

## 初始化

在 IoC 初始化时创建 `LogFactory` 并注册到容器。

`src/service/ioc/index.ts`

```typescript
import { LogFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

// 默认使用 Console 输出（debug 级别）
const logFactory = new service.LogFactory();
Container.set(LogFactoryBase, logFactory);
```

`LogFactory` 构造参数为可选的配置对象，支持 `console` 和 `log4js` 两个字段，二者互斥，`log4js` 优先。

---

## Console 日志

适合开发环境，直接输出到终端。

```typescript
const logFactory = new service.LogFactory({
    console: {
        level: 'debug',                        // debug | info | error | none
        timeFormatter: 'YYYY-MM-DDTHH:mm:ss.SSS',  // dayjs 格式
    }
});
```

输出格式：

```
[2024-01-01T12:00:00.000] [DEBUG] - {"title":"用户登录","userId":"123"}
[2024-01-01T12:00:01.000] [INFO]  - {"title":"订单创建","orderId":"456"}
[2024-01-01T12:00:02.000] [ERROR] - {"title":"支付失败","error":"Error: ..."}
```

日志级别说明（从低到高）：

| 级别 | 说明 |
|------|------|
| `debug` | 输出所有日志 |
| `info` | 输出 info 和 error |
| `error` | 只输出 error |
| `none` | 不输出任何日志 |

---

## log4js 日志

适合生产环境，支持文件输出、日志滚动等。

```typescript
const logFactory = new service.LogFactory({
    log4js: {
        appenders: {
            file: {
                type: 'dateFile',
                filename: 'logs/app',
                pattern: 'yyyy-MM-dd.log',
                alwaysIncludePattern: true,
                keepFileExt: false,
            },
            console: {
                type: 'console',
            }
        },
        categories: {
            default: {
                appenders: ['file', 'console'],
                level: 'info',
            }
        }
    }
});
```

也可以在 `config.yaml` 中配置，通过 `cfg.logConfiguration` 传入：

```yaml
App:
    port: 3000
    name: my-app
    logConfiguration:
        log4js:
            appenders:
                file:
                    type: dateFile
                    filename: logs/app
                    pattern: yyyy-MM-dd.log
                    alwaysIncludePattern: true
            categories:
                default:
                    appenders: [file]
                    level: info
```

```typescript
const logFactory = new service.LogFactory(cfg.logConfiguration);
```

---

## 使用日志

通过 `logFactory.build()` 获取日志实例，使用链式调用 `addField()` 添加字段，最后调用级别方法输出。

```typescript
import { IApi, LogFactoryBase, decorator, RouterContext } from 'tiger-ts';
import { Inject, Service } from 'typedi';

const { Api } = decorator;

@Api({ route: '/user/login', method: 'POST' })
@Service()
export class LoginApi implements IApi {

    @Inject()
    public logFactory: LogFactoryBase;

    public async call(ctx: RouterContext) {
        const log = this.logFactory.build();

        // debug 日志
        log.addField('title', '用户登录')
           .addField('username', ctx.request.body.username)
           .debug();

        try {
            // 业务逻辑...

            // info 日志
            this.logFactory.build()
                .addField('title', '登录成功')
                .addField('userId', 'user-123')
                .info();

            return 'ok';
        } catch (err) {
            // error 日志，自动附加 err.stack
            this.logFactory.build()
                .addField('title', '登录失败')
                .addField('username', ctx.request.body.username)
                .error(err);

            throw err;
        }
    }
}
```

`ILog` 接口方法说明：

| 方法 | 说明 |
|------|------|
| `addField(key, value)` | 添加一个字段，返回自身支持链式调用 |
| `debug()` | 以 debug 级别输出并清空字段 |
| `info()` | 以 info 级别输出并清空字段 |
| `error(err)` | 以 error 级别输出，自动附加 `err.stack`，并清空字段 |

每次调用 `build()` 会返回一个新的日志实例，字段相互独立，不会互相污染。
