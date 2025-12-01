import { v4 } from 'uuid';

import { StringGeneratorBase } from '../../contract';

/**
 * 生成 36 位的无序字符串
 * 格式为: 8-4-4-4-12
 */
export class UuidV4StringGenerator extends StringGeneratorBase {
    public generator() {
        return v4();
    }
}
