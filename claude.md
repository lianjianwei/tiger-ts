# tiger-ts
tiger-ts 是一个服务端框架，用于快速，高效的构建Node.js服务端应用，使用 TypeScript 编写。

## 技术栈
* koa
* typescript
* redis
* mongodb
* sequelize

## 项目结构
src/
├── contract/     # 接口层
├── service/      # 接口实现层，服务层
├── model/        # 数据模型，配置模型，枚举模型
├── decorator/    # 装饰器

## 编码规范
- 变量/函数：camelCase
- 类/组件：PascalCase
- 常量：UPPER_SNAKE_CASE
- 文件名：kebab-case
- 必须用 typescript 编写
- 接口的公开函数必须 JSDoc 注释（含 @param/@returns）

## 常用命令
- 构建：npm run build
- 测试：npm test ${相对路径|或者不填写测试全部}
- 发布：npm run release

## 测试要求
服务层的实现最好有对应的测试文件，命名规则为 xxx.test.ts ，例如：
src/service/parser/value.ts 对应的测试文件为 src/service/parser/value.test.ts