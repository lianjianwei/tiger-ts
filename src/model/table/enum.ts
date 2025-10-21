import { DbModel, EnumItem } from '../../contract';

export class Enum extends DbModel {
    public items: EnumItem[];
}
