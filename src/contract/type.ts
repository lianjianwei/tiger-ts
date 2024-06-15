export interface Type<T = any> extends Function {
    ctor?: string;
    new(...args: any[]): T;
}
