import { strictEqual } from 'assert';

import { Api, metedata } from './decorator';
import { IApi } from '../../contract';

// @ts-ignore
@Api('/mh/login')
class TestApi implements IApi {
    call(): Promise<any> {
        throw new Error('Method not implemented.');
    }
}

describe('src/service/api/decortor.ts', () => {
    describe('@Api()', () => {
        it('ok', async () => {
            strictEqual(metedata['/mh/login'], TestApi);
        });
    });
});
