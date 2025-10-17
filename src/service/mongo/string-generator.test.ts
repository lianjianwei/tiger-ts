import { strictEqual } from 'assert';

import { MongoStringGenerator as Self } from './string-generator';

describe('src/service/mongo/string-generator.ts', () => {
    describe('.generator()', () => {
        it('specified db', async () => {
            const self = new Self();
            const res = self.generator();
            strictEqual(res.length == 24, true);
        });
    });
});
