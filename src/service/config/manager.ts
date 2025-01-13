import { ioc } from '../ioc';
import { Type, ConfigManagerBase } from '../../contract';

export class ConfigManager extends ConfigManagerBase {

    private m_Cache: Map<string, any> = new Map();

    public get<T>(typer: Type<T>): T {
        const key = ioc.getKey(typer);
        const result = this.m_Cache.get(key);
        return result as T;
    }

    public update<T>(typer: Type<T>, data: T) {
        const key = ioc.getKey(typer);
        this.m_Cache.set(key, data);
    }
}
