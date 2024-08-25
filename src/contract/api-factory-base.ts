import { Type } from './type';

export interface IApi<TBody = any, THeader = any> {
    body?: TBody;
    header?: THeader;

    call(): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): { api: IApi; validateType: Type<any>; };
}
