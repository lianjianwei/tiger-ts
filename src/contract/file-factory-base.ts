export interface IFile {
    /**
     * 扩展名
     */
    readonly ext: string;
    /**
     * 文件名(包含扩展名)
     */
    readonly name: string;
    /**
     * 文件路径
     */
    readonly path: string;
    /**
     * 文件是否存在
     */
    exists(): Promise<boolean>;
    /**
     * 读取文件内容（字符串形式）
     */
    read(): Promise<string>;
    /**
     * 读取JSON字符串数据转化为指定类型数据返回
     */
    readJson<T>(): Promise<T>;
    /**
     * 删除文件
     */
    remove(): Promise<void>;
}


export interface IDirectory {
    /**
     * 目录名
     */
    readonly name: string;
    /**
     * 目录路径
     */
    readonly path: string;
    /**
     * 目录是否存在
     */
    exists(): Promise<boolean>;
    /**
     * 查找该目录底下所有目录
     */
    findDirs(): Promise<IDirectory[]>;
    /**
     * 查找该目录底下所有文件
     */
    findFiles(): Promise<IFile[]>;
    /**
     * 删除文件
     */
    remove(): Promise<void>;
}

export abstract class FileFactoryBase {
    public abstract buildDirectory(...paths: string[]): IDirectory;
    public abstract buildFile(...paths: string[]): IFile;
}