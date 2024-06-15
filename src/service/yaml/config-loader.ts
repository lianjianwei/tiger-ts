import yaml from 'yaml';

import ioc from '../ioc';
import { ConfigLoaderBase, IFile, Type } from '../../contract';

export class YamlConfigLoader extends ConfigLoaderBase {

    private m_Content: Promise<{ [name: string]: Type<any>; }>;

    public constructor(
        private m_File: IFile
    ) {
        super();
    }

    public async load<T>(typer: Type<T>) {
        this.m_Content ??= new Promise<{ [name: string]: Type<any>; }>(async (s, f) => {
            try {
                const data = await this.m_File.read();
                s(yaml.parse(data));
            } catch (err) {
                f(err);
            }
        });
        const content = await this.m_Content;
        const key = ioc.getKey(typer);
        return content[key] as T;
    }
}
