import { ObjectId } from 'mongodb';

import { StringGeneratorBase } from '../../contract';

export class MongoStringGenerator extends StringGeneratorBase {
    public generator() {
        return new ObjectId().toHexString();
    }
}
