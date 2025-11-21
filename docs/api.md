## API

tiger-ts 提供了方便的 API 路由装饰器，用于定义 API 路由。

### 示例

```
import 'reflect-metadata';

import { decorator, IApi, RouterContext, service } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

@Api('/hello', {
    method: 'GET',
    origin: true
})
@Service()
export class TestApi implements IApi {
    public async call(ctx: RouterContext<any, any>) {
        console.log('query -> ', ctx.request.query);
        console.log('path -> ', ctx.request.path);
        return 'hello tiger-ts';
    }
}

const logFactory = new service.LogFactory();
const apiFactory = new service.ApiFactory();

const app = new service.KoaApplication(
    [
        service.koaRouteOption(apiFactory)
    ],
    logFactory
);

app.listen(30000, () => {
    console.log('服务启动成功 http://127.0.0.1:30000');
});
```

tiger-ts 使用 `@Api('路由')` 定义一个 API 路由，推荐使用 post 方法定义 API 路由，默认的 method 为 POST，这里要用 GET 就需要显示指定。

### 返回数据

`origin` 表示是否返回原始数据，默认值为 `false`，如果设置为 `true`，则直接返回 API 实现类的返回值，否则会包装成 `{ err: number; data:? any }` 格式返回，`err` 表示错误码，`data` 表示返回数据（Api的 call 方法的返回值）。

### Api是单例？

`@Service` 是 typedi 的装饰器，表示把这个实例注册到 typedi 的容器中，后续使用 Api 时可以通过 `Container.get(TestApi)` 来获取这个实例，默认是单例的，所以如果你在 `TestApi` 中记录一些私有属性，对于所有请求的用户都是共享的，例如你想统计本次启动服务后有多少人访问过这个Api，那么可以：

```typescript
@Api('/hello', {
    method: 'GET',
    origin: true
})
@Service()
export class TestApi implements IApi {

    private m_Count = 0;

    public async call(_ctx: RouterContext<any, any>) {
        console.log('访问多少次 -> ', ++this.m_Count);
        return 'hello tiger-ts';
    }
}
```

此时你在多次访问 `http://127.0.0.1:30000/hello` 那么会看到 count 的数量会一直累加。

如果你想要每次访问 Api 都是一个新的实例，可以这么设置：

```typescript
@Api('/hello', {
    method: 'GET',
    origin: true
})
@Service({ transient: true })
export class TestApi implements IApi {

    private m_Count = 0;

    public async call(_ctx: RouterContext<any, any>) {
        console.log('访问多少次 -> ', ++this.m_Count);
        return 'hello tiger-ts';
    }
}
```

此时你会发现不管访问多少次 count 都是 1。

### POST 参数校验

如果你想对 POST 请求体参数做一些校验，可以使用 `class-validator` 

```
npm i class-validator
```

```typescript
import 'reflect-metadata';

import { service } from 'tiger-ts';
import { Length } from 'class-validator';
import { decorator, IApi, RouterContext } from 'tiger-ts';
import { Service } from 'typedi';

const { Api } = decorator;

class TestRequestBody {
    @Length(3, 10)
    public name: string;
}

@Api('/hello', {
    method: 'POST',
    validateType: TestRequestBody
})
@Service()
export class TestApi implements IApi<TestRequestBody> {

    public async call(ctx: RouterContext<any, any>) {
        console.log(ctx.request.body);
        return 'hello tiger-ts';
    }
}

const logFactory = new service.LogFactory();
const apiFactory = new service.ApiFactory();

const app = new service.KoaApplication(
    [
        service.koaBodyOption(),
        service.koaLogOption(logFactory),
        service.koaRouteOption(apiFactory)
    ],
    logFactory
);

app.listen(30000, () => {
    console.log('服务启动成功 http://127.0.0.1:30000');
});

```

引入 `class-validator` 后，你可以在 `TestRequestBody` 中定义校验规则，例如 `@Length(3, 10)` 表示 `name` 字段的长度必须在 3 到 10 之间。

如果请求体参数校验失败，tiger-ts 会自动返回下面格式的错误响应：

```
{
  "err": 503,
  "errMsg": [
    {
      "target": {
        "name": "1"
      },
      "value": "1",
      "property": "name",
      "children": [],
      "constraints": {
        "isLength": "name must be longer than or equal to 3 characters"
      }
    }
  ]
}
```
