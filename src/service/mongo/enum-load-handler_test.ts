import { deepStrictEqual } from 'assert';

import { Enum, MongoEnumLoadHandler as Self } from './enum-load-handler';
import { Mock } from '../mock';
import { DbFactoryBase, EnumItem, IDbQuery, IDbRepository } from '../../contract';

class LoginData extends EnumItem {
    public static ctor = 'LoginData';

    public appid: string;
    public secret: string;
};

describe('src/service/mongo/config-loader.ts', () => {
    describe('.load<T>(typer: Type<T>)', () => {
        it('ok', async () => {
            const mockDbFactory = new Mock<DbFactoryBase>();
            const self = new Self(mockDbFactory.actual);

            const mockDbRepository = new Mock<IDbRepository<Enum>>();
            mockDbFactory.exceptReturn(
                r => r.build({
                    model: Enum
                }),
                mockDbRepository.actual
            );
            const mockDbQuery = new Mock<IDbQuery<Enum>>();
            mockDbRepository.exceptReturn(
                r => r.query(),
                mockDbQuery.actual
            );
            mockDbQuery.exceptReturn(
                r => r.findOne({
                    where: {
                        id: LoginData.ctor
                    }
                }),
                {
                    id: LoginData.ctor,
                    items: [
                        {
                            value: 1,
                            appid: '123',
                            secret: '123'
                        },
                        {
                            value: 2,
                            appid: '456',
                            secret: '456'
                        }
                    ]
                }
            );
            const res = await self.load(LoginData);
            deepStrictEqual(res, {
                cacheOn: 0,
                allItem: {
                    1: {
                        value: 1,
                        appid: '123',
                        secret: '123'
                    },
                    2: {
                        value: 2,
                        appid: '456',
                        secret: '456'
                    }
                }
            });
        });
    });
});
