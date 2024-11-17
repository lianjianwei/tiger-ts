import { IParser } from '../../contract';

export class NumberParser implements IParser<number> {
    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data == 'number') {
            return data;
        } else if (typeof data == 'string') {
            const res = Number(data);
            if (Number.isNaN(res))
                throw new Error('NumberParser 解析异常, 无效的数据类型: ' + data);
            return res;
        } else {
            throw new Error('NumberParser 解析异常, 无效的数据类型: ' + JSON.stringify(data));
        }
    }
}
