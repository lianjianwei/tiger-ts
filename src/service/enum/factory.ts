import { ioc } from '../ioc';
import { EnumBuildOption, EnumFactoryBase, EnumItem, EnumLoadFunction, EnumReduceFunction, IEnum, Type } from '../../contract';

export class Enum<T extends EnumItem> implements IEnum<T> {

    private m_Reduce: { [name: string]: Promise<any>; } = {};

    private m_AllItem: Promise<{ [value: number]: T; }>;
    public get allItem() {
        this.m_AllItem ??= this.m_EnumLoadFunction(this.m_Typer, this.m_SrvNo);
        return this.m_AllItem;
    }

    private m_Items: Promise<T[]>;
    public get items() {
        this.m_Items ??= new Promise<T[]>(async (s, f) => {
            try {
                const allItem = await this.allItem;
                s(Object.values(allItem));
            } catch (error) {
                f(error);
            }
        });
        return this.m_Items;
    }

    public constructor(
        private m_Typer: Type<T> | string,
        private m_SrvNo: number,
        private m_EnumLoadFunction: EnumLoadFunction<T>,
        private m_NameReduce: { [name: string]: EnumReduceFunction<T, any>; }
    ) { }

    public getReduce<TReduce>(reduceTyper: Type<TReduce>) {
        const reduceName = ioc.getKey(reduceTyper);
        if (!this.m_NameReduce[reduceName]) {
            const name = ioc.getKey(this.m_Typer);
            throw new Error(`${name}.${reduceName}未配置`);
        }

        this.m_Reduce[reduceName] ??= new Promise<TReduce>(async (s, f) => {
            try {
                const items = await this.items;
                const reduce = items.reduce(this.m_NameReduce[reduceName], {} as TReduce);
                s(reduce);
            } catch (error) {
                f(error);
            }
        });
        return this.m_Reduce[reduceName] as Promise<TReduce>;
    }

    public flush() {
        this.m_AllItem = null;
        this.m_Items = null;
        this.m_Reduce = {};
    }
}

export class EnumFactory extends EnumFactoryBase {

    public m_EnumCache: { 
        [srvNo: number]: {
            [key: string]: IEnum<any>;
        } 
    } = {};

    public constructor(
        private m_EnumLoadFunctionMap: {
            [key: string]: EnumLoadFunction<any>;
        },
        private m_EnumReduce: {
            [enumName: string]: {
                [reduceName: string]: EnumReduceFunction<any, any>;
            };
        } = {}
    ) {
        super();
    }

    public build<T extends EnumItem>(option: EnumBuildOption<T>): IEnum<T> {
        const enumName = ioc.getKey(option.typer);
        option.srvNo ??= 0;
        this.m_EnumCache[option.srvNo] ??= {};
        this.m_EnumCache[option.srvNo][enumName] ??= new Enum(option.typer, option.srvNo, this.m_EnumLoadFunctionMap[enumName] ?? this.m_EnumLoadFunctionMap[''], this.m_EnumReduce[enumName] ?? {});
        return this.m_EnumCache[option.srvNo][enumName];
    }
}
