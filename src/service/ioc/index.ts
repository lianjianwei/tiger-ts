import { Type } from '../../contract';

export function getKey(typer: Type) {
    return typer.ctor ?? typer.name;
}

export const ioc = {
    getKey
};
