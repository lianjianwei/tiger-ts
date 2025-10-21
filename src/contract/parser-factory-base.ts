export interface IParser<T = any> {
    parse(data: any, srvNo?: number): T | null | undefined;
}

export abstract class ParserFactoryBase {
    public abstract build<T>(type: string): IParser<T>;
}
