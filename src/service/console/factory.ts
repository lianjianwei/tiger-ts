import { ConsoleLog } from './console';
import { LogFactoryBase } from '../../contract';

export class LogFactory extends LogFactoryBase {
    public build() {
        return new ConsoleLog();
    }
}
