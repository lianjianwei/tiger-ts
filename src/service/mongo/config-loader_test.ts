import { deepStrictEqual } from 'assert';

import { Config, MongoConfigLoader as Self } from './config-loader';
import { Mock } from '../mock';
import { DbFactoryBase, IDbQuery, IDbRepository } from '../../contract';

class Login {
    public static ctor = 'Login';

    public appid: string;
    public secret: string;
};

describe('src/service/mongo/config-loader.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepository = new Mock<IDbRepository<Config>>();
            mockDbFactory.exceptReturn(
                r => r.build({
                    model: Config
                }),
                mockDbRepository.actual
            );
            const mockDbQuery = new Mock<IDbQuery<Config>>();
            mockDbRepository.exceptReturn(
                r => r.query(),
                mockDbQuery.actual
            );
            mockDbQuery.exceptReturn(
                r => r.findOne({
                    where: {
                        id: Login.ctor
                    }
                }),
                {
                    id: Login.ctor,
                    item: {
                        appid: '123456',
                        secret: '456789'
                    }
                }
            );
            const res = await self.load(Login);
            deepStrictEqual(res, {
                appid: '123456',
                secret: '456789'
            });
        });
    });
});
