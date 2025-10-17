import dayjs from 'dayjs';

import { LogBase, LogFactoryBase } from '../../contract';

export class ConsoleLog extends LogBase {

    public onDebug() {
        console.debug(`[${dayjs().format(LogFactoryBase.logConfig.timeFormatter)}] [DEBUG] - ${JSON.stringify(this.data)}`);
    }

    public onInfo() {
        console.info(`[${dayjs().format(LogFactoryBase.logConfig.timeFormatter)}] [INFO] - ${JSON.stringify(this.data)}`);
    }

    public onError(err: Error) {
        this.data['error'] = err.stack;
        console.error(`[${dayjs().format(LogFactoryBase.logConfig.timeFormatter)}] [ERROR] - ${JSON.stringify(this.data)}`);
    }
}
