import { nanoid, customAlphabet } from 'nanoid';

import { StringGeneratorBase } from '../../contract';

/**
 * 生成指定位数的无序字符串
 */
export class NanoidGenerator extends StringGeneratorBase {

    private m_Nanoid: (size?: number) => string;

    public constructor(
        readonly alphabet = '',
        readonly defaultSize = 21,
    ) {
        super();
        this.m_Nanoid = this.alphabet ? customAlphabet(this.alphabet, defaultSize) : nanoid;
    }

    public generator(size?: number) {
        return this.m_Nanoid(size);
    }
}
