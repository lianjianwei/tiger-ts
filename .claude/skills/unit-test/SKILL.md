---
name: unit-test
description: 为 tiger-ts 服务层文件编写单元测试。当用户要求编写测试、补充测试或指向某个服务文件时自动触发。
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

为以下文件编写单元测试：$ARGUMENTS

## 执行步骤

1. **读取源文件**，理解类名、公开方法的逻辑与边界条件
2. **检查测试文件是否已存在**（同目录，文件名加 `.test.ts` 后缀）
   - 已存在：补充缺少的用例，不删除已有用例
   - 不存在：新建测试文件
3. **读取参考资料**，确保测试风格与项目一致：
   - Mock 工具文档：[docs/mock.md](../../../docs/mock.md)
   - 参考测试示例：[examples/reset-value-handler.test.ts](examples/reset-value-handler.test.ts)
4. **编写测试**，遵循下方规范
5. **运行测试**验证通过：`npm test <测试文件相对路径>`

---

## 测试编写规范

### 文件结构

```typescript
import { strictEqual, deepStrictEqual } from 'assert';
import { TargetClass as Self } from './target-file';
import { Mock } from '../mock';                          // 调整相对路径
import { EnumFactoryBase, IEnum, IValueService } from '../../contract';
import { enum_ } from '../../model';

describe('src/service/path/target-file.ts', () => {
    describe('.methodName()', () => {
        it('场景描述', async () => {
            // 准备 → 执行 → 断言
        });
    });
});
```

### Mock 使用要点

- 用 `new Mock<T>({ prop: value })` 注入**属性**（非方法）
- 用 `mockInstance.exceptReturn(r => r.method(args), returnValue)` 预设**方法调用**
- 返回 `Promise` 的方法直接传值，不需要包 `Promise.resolve`
- 用 `mockAny` 忽略不关心的参数
- 用 `.actual` 获取代理对象传给被测代码

### 用例覆盖原则

每个公开方法至少覆盖：
- 主路径（正常流程）
- 边界/分支（if/else 每个分支）
- 默认值处理（`?? 0`、`|| []` 等）
- `next` 链调用（若是 `ValueHandlerBase` 子类）

### describe / it 命名

```
describe('src/.../file-name.ts')
  describe('.methodName(参数类型)')
    it('无配置时，不修改 xxx')
    it('有配置，条件满足时，返回 xxx')
    it('有配置，条件不满足时，跳过')
```

---

## 当前项目测试命令

```bash
# 运行单个测试文件
npm test src/service/value/reset-value-handler.test.ts

# 运行全部测试
npm test
```
