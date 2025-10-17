# tiger-ts
一个使用TypeScript写的Node.js服务端基础库。

## 功能

1. API定义
    * koa
2. 内存缓存模块
3. 配置加载器
    * yaml 文件配置加载器
4. 枚举工厂
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
10. 日志模块
    * console 日志
    * log4js 日志
11. 解析器
    * number
    * string
    * bool
    * json
    * Value
    * Reward
    * Condition
    * EnumValue
12. 字符串生成器
    * Mongo ObjectId 生成器
13. 线程
14. 分布式锁
    * redis 分布式锁
15. 配置管理器

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
import { Length } from 'class-validator';
import { IApi, service } from 'tiger-ts';

class LoginRequestBody {
    @Length(5, 10, { message: '账号长度在5-10字符' })
    account: string;

    @Length(8, 18, { message: '密码长度在8-18字符' })
    password: string;
}

@service.Api({ route: '/mh/login', validateType: LoginRequestBody })
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
