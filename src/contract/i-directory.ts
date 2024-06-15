import { IFile } from './i-file';

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