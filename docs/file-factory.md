# 文件工厂

`FileFactoryBase` 提供文件和目录操作的统一抽象，`FsFileFactory` 是基于 Node.js `fs` 模块的实现。

## 初始化

```typescript
import { FileFactoryBase, service } from 'tiger-ts';
import { Container } from 'typedi';

const fileFactory = new service.FsFileFactory();
Container.set(FileFactoryBase, fileFactory);
```

## 文件操作（IFile）

通过 `buildFile(...paths)` 构建文件对象，多个路径参数会自动用 `path.join` 拼接。

```typescript
import { FileFactoryBase } from 'tiger-ts';
import { Inject, Service } from 'typedi';

@Service()
export class ConfigService {

    @Inject()
    public fileFactory: FileFactoryBase;

    public async loadConfig() {
        const file = this.fileFactory.buildFile(process.cwd(), 'config.yaml');

        // 文件属性
        console.log(file.path);  // 完整路径
        console.log(file.name);  // 文件名（含扩展名）：'config.yaml'
        console.log(file.ext);   // 扩展名：'.yaml'

        // 检查是否存在
        const exists = await file.exists();
        if (!exists) {
            throw new Error('配置文件不存在');
        }

        // 读取文本内容
        const content = await file.read();

        // 读取 JSON 文件
        const jsonFile = this.fileFactory.buildFile(process.cwd(), 'package.json');
        const pkg = await jsonFile.readJson<{ version: string }>();
        console.log(pkg.version);

        // 删除文件
        await file.remove();
    }
}
```

`IFile` 接口说明：

| 成员 | 说明 |
|------|------|
| `path` | 文件完整路径 |
| `name` | 文件名（含扩展名） |
| `ext` | 扩展名（含 `.`，如 `.yaml`） |
| `exists()` | 检查文件是否存在 |
| `read()` | 读取文件内容，返回 UTF-8 字符串 |
| `readJson<T>()` | 读取并解析 JSON 文件，返回指定类型 |
| `remove()` | 删除文件 |

## 目录操作（IDirectory）

通过 `buildDirectory(...paths)` 构建目录对象。

```typescript
const dir = this.fileFactory.buildDirectory(process.cwd(), 'logs');

// 目录属性
console.log(dir.path);  // 完整路径
console.log(dir.name);  // 目录名：'logs'

// 检查是否存在
const exists = await dir.exists();

// 列出所有子目录
const subDirs = await dir.findDirs();
for (const subDir of subDirs) {
    console.log(subDir.name);
}

// 列出所有文件
const files = await dir.findFiles();
for (const file of files) {
    console.log(file.name, file.ext);
}

// 删除目录
await dir.remove();
```

`IDirectory` 接口说明：

| 成员 | 说明 |
|------|------|
| `path` | 目录完整路径 |
| `name` | 目录名 |
| `exists()` | 检查目录是否存在 |
| `findDirs()` | 返回直接子目录列表 |
| `findFiles()` | 返回目录下的文件列表（不递归） |
| `remove()` | 删除目录 |
