import { Type } from './type';

export class EnumItem {
    public value: number;
    public text?: string;
}

export type EnumReduceFunction<T extends EnumItem, R> = (memo: R, r: T) => R;

export type EnumLoadFunction<T extends EnumItem> = (typer: Type<T> | string) => Promise<{ [value: number]: T; }>;

export interface IEnum<T extends EnumItem> {
    /**
     * 所有数据对象
     */
    readonly allItem: Promise<{ [value: number]: T; }>;

    /**
     * 所有数据数组
     */
    readonly items: Promise<T[]>;

    /**
     * 获取聚合数据
     * 
     * @param reduceTyper
     */
    getReduce<TReduce>(reduceTyper: Type<TReduce>): Promise<TReduce>;

    /**
     * 刷新数据
     */
    flush(): void;
}

export abstract class EnumFactoryBase {
    public abstract build<T extends EnumItem>(typer: Type<T> | string): IEnum<T>;
}
