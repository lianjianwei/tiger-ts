# 快速开始

本文档帮助你在 5 分钟内用 tiger-ts 搭建一个 Node.js 服务端应用。

## 安装

```bash
npm install tiger-ts reflect-metadata typedi
```

在 `tsconfig.json` 中启用装饰器支持：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 项目结构

```
my-app/
├── src/
│   ├── api/
│   │   └── hello.ts       # API 接口
│   ├── model/
│   │   └── config/
│   │       └── app.ts     # 配置模型
│   ├── service/
│   │   └── ioc/
│   │       └── index.ts   # IoC 初始化
│   └── index.ts           # 应用入口
├── config.yaml            # 配置文件
└── package.json
```

## 第一步：定义配置模型

`src/model/config/app.ts`

```typescript
export class App {
    public name: string;
    public version: string;
    public port: number;
}
```

## 第二步：创建配置文件

`config.yaml`

```yaml
App:
    port: 3000
    name: my-app
```

## 第三步：初始化 IoC 容器

`src/service/ioc/index.ts`

```typescript
import { ConfigLoaderBase, FileFactoryBase, LogFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';
import { App } from '../../model/config/app';

export async function initIoC() {
    // 文件工厂
    const fileFactory = new service.FsFileFactory();
    Container.set(FileFactoryBase, fileFactory);

    // 加载 YAML 配置
    const configFile = fileFactory.buildFile(process.cwd(), 'config.yaml');
    const configLoader = new service.YamlConfigLoader(configFile);
    const cfg = await configLoader.load(App);
    Container.set(ConfigLoaderBase, configLoader);

    // 读取 package.json 版本号
    const pkgFile = fileFactory.buildFile(process.cwd(), 'package.json');
    const pkg = await pkgFile.readJson<{ version: string }>();
    cfg.version = pkg.version;

    // 日志工厂（默认使用 console）
    const logFactory = new service.LogFactory();
    Container.set(LogFactoryBase, logFactory);

    return cfg;
}
```

## 第四步：定义 API

`src/api/hello.ts`

```typescript
import { IsNotEmpty } from 'class-validator';
import { IApi, decorator, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

class HelloBody {
    @IsNotEmpty()
    public name: string;
}

@Api({ route: '/hello', method: 'POST', validateType: HelloBody })
@Service()
export class HelloApi implements IApi {
    public async call(ctx: RouterContext<HelloBody>) {
        return `Hello, ${ctx.request.body.name}!`;
    }
}
```

`@Api` 装饰器参数说明：

| 参数 | 说明 |
|------|------|
| `route` | 路由路径 |
| `method` | HTTP 方法，默认 `POST` |
| `validateType` | 请求体验证类，使用 class-validator |

## 第五步：启动应用

`src/index.ts`

```typescript
import 'reflect-metadata';
import './api/hello';  // 导入 API 以触发装饰器注册

import { LogFactoryBase, service } from 'tiger-ts';
import Container from 'typedi';
import { initIoC } from './service/ioc';

(async () => {
    const cfg = await initIoC();

    const apiFactory = new service.ApiFactory();
    const logFactory = Container.get(LogFactoryBase);

    new service.KoaApiPort([
        service.koaBodyOption(),
        service.koaPostOption(apiFactory, logFactory),
        service.koaPortOption(cfg.name, cfg.port, cfg.version),
    ]).listen();
})();
```

启动：

```bash
npx ts-node src/index.ts
```

测试接口：

```bash
curl -X POST http://localhost:3000/hello \
  -H "Content-Type: application/json" \
  -d '{"name": "world"}'
# 返回: "Hello, world!"
```

## 请求与响应格式

tiger-ts 的 POST 接口统一使用以下格式：

**请求**

```json
{
    "name": "world"
}
```

**成功响应**

```json
{
    "data": "Hello, world!"
}
```

**验证失败响应**（当请求体不符合 `validateType` 定义时）

```json
{
    "err": 1,
    "message": "name should not be empty"
}
```

## 下一步

- [API 文档](./api.md) — 查看所有模块的完整 API 参考
- 添加数据库：参考 API 文档中的 MongoDB / Sequelize 章节
- 添加 Redis 分布式锁：参考 API 文档中的 Mutex 章节
- 配置 log4js 日志：在 `config.yaml` 中添加 `logConfiguration` 配置
