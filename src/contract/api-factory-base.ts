export interface IApi<TBody = any, THeader = any> {
    body?: TBody;
    header?: THeader;

    call(): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): IApi;
}
