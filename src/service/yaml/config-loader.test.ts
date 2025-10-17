import 'reflect-metadata';

import { strictEqual } from 'assert';

import { YamlConfigLoader as Self } from './config-loader';
import { Mock } from '../mock';
import { IFile } from '../../contract';

class Default {
    public static ctor = 'Default';

    public name: string;
}

describe('src/service/yaml/config-loader.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('load Default success', async () => {
            const mockFile = new Mock<IFile>();
            const self = new Self(mockFile.actual);
            mockFile.exceptReturn(
                r => r.read(),
                `Default:\r\n  name: turn-based-game-server`
            );
            const cfg = await self.load(Default);
            strictEqual(cfg.name, 'turn-based-game-server');
        });

        it('load NotFound failed', async () => {
            class NotFound { }
            const mockFile = new Mock<IFile>();
            const self = new Self(mockFile.actual);
            mockFile.exceptReturn(
                r => r.read(),
                `Default:\r\n  name: turn-based-game-server`
            );
            const res = await self.load(NotFound);
            strictEqual(res, undefined);
        });
    });
});
