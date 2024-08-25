import { Type } from '../../contract';

export function getKey<T = any>(typer: Type<T>) {
    return typer.ctor ?? typer.name;
}

export const ioc = {
    getKey
};
