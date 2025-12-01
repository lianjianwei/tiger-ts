import { ObjectId } from 'mongodb';

import { StringGeneratorBase } from '../../contract';

/**
 * 生成 24 位的有序字符串
 */
export class MongoStringGenerator extends StringGeneratorBase {
    public generator() {
        return new ObjectId().toHexString();
    }
}
