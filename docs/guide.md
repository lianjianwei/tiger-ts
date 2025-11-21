# 引导

这篇文档讲解了如何快速开始使用 tiger-ts 框架最基本的功能。

## 手动初始化项目

1. 使用 npm 初始化项目

```
npm init
```

2. 安装依赖

```
npm i tiger-ts typedi reflect-metadata
```

```
npm i -D @types/node mocha ts-node typescript @types/koa__router
```

3. 配置 tsconfig.json

tsconfig.json
```
{
    "compilerOptions": {
        "declaration": true,
        "emitDecoratorMetadata": true,
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "forceConsistentCasingInFileNames": true,
        "module": "CommonJS",
        "moduleResolution": "Node",
        "outDir": "./dist",
        "noEmitOnError": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "skipLibCheck": true,
        "strictPropertyInitialization": false,
        "strictNullChecks": false,
        "noImplicitAny": false,
        "target": "ESNext"
    },
    "exclude": [
        "node_modules"
    ],
    "include": [
        "./src/**/*.ts"
    ]
}
```

tsconfig.build.json
```
{
    "extends": "./tsconfig.json",
    "exclude": [
        "node_modules",
        "./src/**/*.test.ts",
    ]
}
```

4. 编写启动脚本

src/index.ts
```typescript
import 'reflect-metadata';

import Router from '@koa/router';
import { service } from 'tiger-ts';

const logFactory = new service.LogFactory();

const app = new service.KoaApplication(
    [
        (app) => {
            const router = new Router();
            router.get('/hello', async (ctx) => {
                ctx.body = 'hello tiger-ts';
            });
            app.use(router.routes());
            app.use(router.allowedMethods());
        }
    ],
    logFactory
);

app.listen(30000, () => {
    console.log('服务启动成功 http://127.0.0.1:30000');
});
```

5. 配置 package.json 启动脚本

package.json
```
{
    "scripts": {
        "server": "ts-node src/index.ts"
    },
    // ......
}
```

6. 启动服务

```
npm run server
```

现在就可以访问页面 http://localhost:30000/hello

## 脚手架初始化项目（暂未实现脚手架）
