import ioc from '../ioc';
import { EnumFactoryBase, EnumItem, EnumReduceFunction, IEnum, IEnumLoadHandler, Type } from '../../contract';

export class Enum<T extends EnumItem> implements IEnum<T> {

    private m_CacheOn: number = null;

    private m_Reduce: { [name: string]: any; } = {};

    public get allItem() {
        return new Promise<{ [value: number]: T; }>(async (s, f) => {
            try {
                const res = await this.m_EnumLoadHandler.load(this.m_Typer);
                s(res.allItem);
            } catch (err) {
                f(err);
            }
        });
    }

    public constructor(
        private m_EnumLoadHandler: IEnumLoadHandler,
        private m_Typer: Type<T>,
        private m_NameReduce: { [name: string]: EnumReduceFunction<T, any>; }
    ) { }

    public async getReduce<TReduce>(reduceTyper: Type<TReduce>) {
        const res = await this.m_EnumLoadHandler.load(this.m_Typer);
        if (this.m_CacheOn != res.cacheOn) {
            this.m_Reduce = {};
            this.m_CacheOn = res.cacheOn;
        }

        const reduceName = ioc.getKey(reduceTyper);
        if (!this.m_NameReduce[reduceName]) {
            const name = ioc.getKey(this.m_Typer);
            throw new Error(`${name}.${reduceName}未配置`);
        }

        this.m_Reduce[reduceName] ??= Object.values(res.allItem).reduce(this.m_NameReduce[reduceName], {});
        return this.m_Reduce[reduceName] as TReduce;
    }
}

export class EnumFactory extends EnumFactoryBase {

    private m_Cache: {
        [enumName: string]: IEnum<any>;
    } = {};

    public constructor(
        private m_EnumLoadHandler: IEnumLoadHandler,
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
        this.m_Cache[enumName] ??= new Enum(this.m_EnumLoadHandler, typer, this.m_EnumReduce[enumName] ?? {});
        return this.m_Cache[enumName];
    }
}
