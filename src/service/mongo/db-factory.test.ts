import { strictEqual } from 'assert';
import { MongoClient } from 'mongodb';

import { MongoDbFactory as Self } from './db-factory';

describe('src/service/mongo/db-factory.ts', () => {
    describe('.getOriginConnection<T>()', () => {
        it.skip('specified db', async () => {
            const self = new Self('mongodb://127.0.0.1:27017', 'ball-mage-account', null);
            const client = await self.getOriginConnection<MongoClient>();
            const db = client.db();
            strictEqual(db.databaseName, 'ball-mage-account');
            await client.close();
        });
    });
});
