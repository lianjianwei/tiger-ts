import { Type } from './type';

export type EnumReduceFunction<T, R> = (memo: R, r: T) => R;

export class EnumItem {
    public value: number;
    public text?: string;
}

export interface IEnum<T extends EnumItem> {
    /**
     * 所有数据对象
     */
    readonly allItem: { [value: number]: T; };

    /**
     * 所有数据数组
     */
    readonly items: T[];

    /**
     * 获取聚合数据
     * 
     * @param reduceTyper
     */
    getReduce<TReduce>(reduceTyper: Type<TReduce>): TReduce;

    /**
     * 更新数据
     * @param allItem 数据
     */
    update(allItem: { [value: number]: T; }): void;
}

export abstract class EnumFactoryBase {
    public abstract build<T extends EnumItem>(typer: Type<T> | string): IEnum<T>;
}
