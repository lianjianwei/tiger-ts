import { Type } from '../../contract';

export function getKey(typer: Type<any> | string) {
    return typeof typer == 'string' ? typer : typer.ctor ?? typer.name;
}

export const ioc = {
    getKey
};
