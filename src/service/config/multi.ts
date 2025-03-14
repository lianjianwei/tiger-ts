import { ioc } from '../ioc';
import { Type, ConfigLoaderBase } from '../../contract';

export class MultiConfigLoader extends ConfigLoaderBase {

    private m_Cache: { [name: string]: Promise<any>; } = {};

    public constructor(
        private m_ConfigLoaders: ConfigLoaderBase[]
    ) {
        super();
    }

    public load<T>(typer: Type<T> | string): Promise<T> {
        const key = ioc.getKey(typer);
        this.m_Cache[key] ??= new Promise<T>(async (s, f) => {
            try {
                for (const loader of this.m_ConfigLoaders) {
                    const cfg = await loader.load(typer);
                    if (cfg) {
                        s(cfg);
                        return;
                    }
                }
                s(null);
            } catch (e) {
                f(e);
            }
        });
        return this.m_Cache[key];
    }

    public async flush<T>(typer?: Type<T> | string) {
        if (typer) {
            const key = ioc.getKey(typer);
            delete this.m_Cache[key];
        } else {
            this.m_Cache = {};
        }
    }
}
