export interface IParser<T = any> {
    parse(data: any): T | null | undefined;
}

export abstract class ParserFactoryBase {
    public abstract build<T>(type: string): IParser<T>;
}
