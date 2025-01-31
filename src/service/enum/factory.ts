import { ioc } from '../ioc';
import { EnumFactoryBase, EnumItem, EnumReduceFunction, IEnum, Type } from '../../contract';

export class Enum<T extends EnumItem> implements IEnum<T> {

    private m_Reduce: { [name: string]: any; } = {};

    private m_AllItem: { [value: number]: T; } = {};
    public get allItem() {
        return this.m_AllItem;
    }

    private m_Items: T[];
    public get items() {
        this.m_Items ??= Object.values(this.allItem);
        return this.m_Items;
    }

    public constructor(
        private m_Typer: Type<T>,
        private m_NameReduce: { [name: string]: EnumReduceFunction<T, any>; }
    ) { }

    public getReduce<TReduce>(reduceTyper: Type<TReduce>) {
        const reduceName = ioc.getKey(reduceTyper);
        if (!this.m_NameReduce[reduceName]) {
            const name = ioc.getKey(this.m_Typer);
            throw new Error(`${name}.${reduceName}未配置`);
        }

        this.m_Reduce[reduceName] ??= this.items.reduce(this.m_NameReduce[reduceName], {});
        return this.m_Reduce[reduceName] as TReduce;
    }

    public update(allItem: { [value: number]: T; }) {
        this.m_AllItem = allItem;
        this.m_Items = null;
        this.m_Reduce = {};
    }
}

export class EnumFactory extends EnumFactoryBase {

    public m_EnumCache: { [key: string]: IEnum<any>; } = {};

    public constructor(
        private m_EnumReduce: {
            [enumName: string]: {
                [reduceName: string]: EnumReduceFunction<any, any>;
            };
        } = {}
    ) {
        super();
    }

    public build<T extends EnumItem>(typer: Type<T>): IEnum<T> {
        const enumName = ioc.getKey(typer);
        this.m_EnumCache[enumName] ??= new Enum(typer, this.m_EnumReduce[enumName] ?? {});
        return this.m_EnumCache[enumName];
    }
}
