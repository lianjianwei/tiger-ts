import { v7 } from 'uuid';

import { StringGeneratorBase } from '../../contract';

/**
 * 生成 36 位的有序字符串
 * 格式为: 8-4-4-4-12
 */
export class UuidV7StringGenerator extends StringGeneratorBase {
    public generator() {
        return v7();
    }
}
