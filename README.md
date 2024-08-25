# tiger-ts
一个使用TypeScript写的Node.js服务端基础库。

## 功能

1. API定义
    * koa
2. 缓存模块
    * 内存缓存
    * 配置加载器缓存
    * 枚举加载器缓存
3. 配置加载器
    * yaml 文件配置加载器
    * mongo 配置加载器
4. 枚举工厂
    * mongo 枚举加载器
5. 文件工厂
    * IO文件工厂
6. 数值服务
    * 默认数值处理器（累加）
    * 覆盖数值处理器
    * 过滤数值处理器
7. 数据库工厂
    * mongo 数据库工厂
8. 自定义异常类
9. 测试 mock
10. 远程调用[未完成]
    * bent 调用[未完成]
11. 日志模块[未完成]
    * log4js 日志[未完成]

## 安装

```
npm install tiger-ts
```

## 使用

```typescript
// src/api/index.ts
import './login';
```

```typescript
// src/api/login.ts
import { IApi, service } from 'tiger-ts';

type LoginRequestBody = {
    account: string;
    password: string;
}

@service.Api('/mh/login')
@Service({ transient: true })
export default class LoginApi implements IApi<LoginRequestBody> {

    public body: LoginRequestBody;

    public async call() {
        if (body.account == 'admin' && body.password == '123456')
            return true;

        throw new service.CustomError(1000, '账号密码错误');
    }
}
```

```typescript
// src/index.ts
import './api';

import { service } from 'tiger-ts';

(async () => {
    const apiFactory = new service.ApiFactory();
    new service.KoaApiPort([
        service.koaCorsOption(),
        service.koaBodyParserOption(),
        service.koaPostOption(apiFactory),
        service.koaPortOption('app', 30000, '1.0.0')
    ]).listen();
})()
```
