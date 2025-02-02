import dayjs from 'dayjs';

import { LogBase } from '../../contract';

export class ConsoleLog extends LogBase {

    public onDebug() {
        console.debug(`[${dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]')}] [DEBUG] - ${JSON.stringify(this.data)}`);
    }

    public onInfo() {
        console.info(`[${dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]')}] [INFO] - ${JSON.stringify(this.data)}`);
    }

    public onError(err: Error) {
        this.data['error'] = err.stack;
        console.error(`[${dayjs().format('YYYY-MM-DDTHH:mm:ssZ[Z]')}] [ERROR] - ${JSON.stringify(this.data)}`);
    }
}
