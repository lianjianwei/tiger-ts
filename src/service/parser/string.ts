import { IParser } from '../../contract';

export class StringParser implements IParser<string> {
    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data == 'string') {
            return data;
        } else if (typeof data == 'number') {
            return data.toString();
        } else if (typeof data == 'object') {
            return JSON.stringify(data);
        } else {
            throw new Error('StringParser 解析异常, 无效的数据类型: ' + data);
        }
    }
}
