export interface IApi {
    call(): Promise<any>;
}

export abstract class ApiFactoryBase {
    public abstract build(route: string): IApi;
}
