export type Type<T> = {
    ctor?: string;
    new(...args: any[]): T;
};
