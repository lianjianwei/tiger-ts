import dayjs from 'dayjs';

import { ILog } from '../../contract';

export class ConsoleLog implements ILog {

    private m_Data: { [key: string]: any; } = {};

    public addField(key: string, value: any) {
        this.m_Data[key] = value;
        return this;
    }

    public debug() {
        console.debug(`[${dayjs().format()}] [DEBUG] - ${JSON.stringify(this.m_Data)}`);
        this.m_Data = {};
    }

    public info() {
        console.info(`[${dayjs().format()}] [INFO] - ${JSON.stringify(this.m_Data)}`);
        this.m_Data = {};
    }

    public error(err: Error) {
        this.m_Data['error'] = err;
        console.error(`[${dayjs().format()}] [ERROR] - ${JSON.stringify(this.m_Data)}`);
        this.m_Data = {};
    }
}
