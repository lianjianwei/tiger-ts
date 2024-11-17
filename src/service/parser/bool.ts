import { IParser } from '../../contract';

export class BoolParser implements IParser<boolean> {
    public parse(data: any) {
        if (data == null)
            return null;

        if (typeof data == 'boolean') {
            return data;
        } else {
            return !!data;
        }
    }
}
