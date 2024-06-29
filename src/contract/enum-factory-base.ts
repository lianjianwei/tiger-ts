import { Type } from './type';

export interface IEnumLoadHandler {
    load<T extends EnumItem>(typer: Type<T>): Promise<{
        allItem: { [value: number]: T; };
        cacheOn: number;
    }>;
}

export type EnumReduceFunction<T, R> = (memo: R, r: T) => R;

export class EnumItem {
    public value: number;
    public text?: string;
}

export interface IEnum<T extends EnumItem> {
    /**
     * 所有数据
     */
    readonly allItem: Promise<{ [value: number]: T; }>;

    /**
     * 获取聚合数据
     * 
     * @param reduceTyper
     */
    getReduce<TReduce>(reduceTyper: Type<TReduce>): Promise<TReduce>;
}

export abstract class EnumFactoryBase {
    public abstract build<T extends EnumItem>(typer: Type<T>): IEnum<T>;
}
