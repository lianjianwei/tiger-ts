import { strictEqual } from 'assert';

import { Api, API_METEDATA } from './decorator';
import { IApi } from '../../contract';

@Api({ route: '/mh/login' })
class TestApi implements IApi {
    call(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}

describe('src/service/api/decortor.ts', () => {
    describe('@Api()', () => {
        it('ok', async () => {
            strictEqual(API_METEDATA['/mh/login'].api, TestApi);
        });
    });
});
