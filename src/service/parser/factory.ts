import { IParser, ParserFactoryBase, Type } from '../../contract';

export class ParserFactory extends ParserFactoryBase {

    public constructor(
        private m_Parser: {
            [type: string]: Type<IParser>;
        }
    ) {
        super();
    }

    public build<T>(type: string): IParser<T> {
        const typer = this.m_Parser[type];
        if (!typer)
            throw new Error(`ParserFactory 未提供 [${type}] 类型解析器`);

        return new typer();
    }
}
