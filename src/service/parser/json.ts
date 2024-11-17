import { IParser } from '../../contract';

export class JsonParser implements IParser<object> {
    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data == 'object') {
            return data;
        } else if (typeof data == 'string') {
            return JSON.parse(data);
        } else {
            throw new Error('JsonParser 解析异常, 无效的数据类型: ' + JSON.stringify(data) + `[${typeof data}]`);
        }
    }
}
