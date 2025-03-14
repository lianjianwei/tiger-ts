import 'reflect-metadata';

import { strictEqual } from 'assert';

import { MultiConfigLoader as Self } from './multi';
import { Mock } from '../mock';
import { ConfigLoaderBase } from '../../contract';

class Default {
    public static ctor = 'Default';

    public name: string;
}

describe('src/service/yaml/config-loader.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const loader1 = new Mock<ConfigLoaderBase>();
            const loader2 = new Mock<ConfigLoaderBase>();
            const self = new Self([
                loader1.actual,
                loader2.actual
            ]);
            loader1.exceptReturn(
                r => r.load(Default),
                null
            );
            loader2.exceptReturn(
                r => r.load(Default),
                {
                    name: 'name'
                }
            );
            const cfg = await self.load(Default);
            strictEqual(cfg.name, 'name');
        });
    });

    describe('.flush<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const loader1 = new Mock<ConfigLoaderBase>();
            const self = new Self([
                loader1.actual,
            ]);
            loader1.exceptReturn(
                r => r.load(Default),
                {
                    name: 'name'
                }
            );
            await self.load(Default);

            self.flush(Default);

            loader1.exceptReturn(
                r => r.load(Default),
                {
                    name: 'name2'
                }
            );
            const cfg = await self.load(Default);
            strictEqual(cfg.name, 'name2');
        });
    });
});
