import log4js from 'log4js';

import { ConsoleLog, ConsoleLogConfig } from './console';
import { Log4jsLog } from './log4js';
import { LogFactoryBase } from '../../contract';

export class LogFactory extends LogFactoryBase {

    private m_Log4js: boolean = false;

    public constructor(logCfg: {
        console?: ConsoleLogConfig;
        log4js?: log4js.Configuration;
    } = {}) {
        super();

        if (logCfg.log4js) {
            Log4jsLog.init(logCfg.log4js);
            this.m_Log4js = true;
        } else if (logCfg.console) {
            ConsoleLog.init(logCfg.console);
        }
    }

    public build() {
        return this.m_Log4js ? new Log4jsLog() : new ConsoleLog();
    }
}
