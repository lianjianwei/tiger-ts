import { DbModel, EnumItem } from '../../contract';

export class Enum extends DbModel {

    public declare id: string;

    public items: EnumItem[];
}
