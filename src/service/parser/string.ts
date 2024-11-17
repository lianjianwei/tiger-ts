import { IParser } from '../../contract';

export class StringParser implements IParser<string> {
    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data == 'string') {
            return data;
        } else if (typeof data == 'string') {
            return JSON.stringify(data);
        }
    }
}
