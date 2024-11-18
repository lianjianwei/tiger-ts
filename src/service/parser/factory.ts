import { IParser, ParserFactoryBase } from '../../contract';

export class ParserFactory extends ParserFactoryBase {

    public constructor(
        private m_Parser: {
            [type: string]: IParser;
        }
    ) {
        super();
    }

    public build<T>(type: string): IParser<T> {
        const parser = this.m_Parser[type];
        if (!parser)
            throw new Error(`ParserFactory 未提供 [${type}] 类型解析器`);

        return parser;
    }
}
