import Redis from 'ioredis';

import { MutexBase, MutexOption, ThreadBase } from '../../contract';

export class RedisMutex extends MutexBase {

    public constructor(
        private m_Redis: Redis,
        private m_Thread: ThreadBase
    ) {
        super();
    }

    public async lock(option: MutexOption) {
        option.timeoutSeconds ??= 10;
        const ok = await this.m_Redis.set(option.key, 'ok', 'EX', option.timeoutSeconds, 'NX');
        return ok === 'OK' ? async () => {
            await this.m_Redis.del(option.key);
        } : null;
    }

    public async waitLock(option: MutexOption) {
        option.timeoutSeconds ??= 10;
        option.tryCount ??= 50;
        option.sleepRange ??= [100, 200];

        let count = 0;
        while (count < option.tryCount) {
            const unlock = await this.lock(option);
            if (unlock) {
                return unlock;
            }

            count++;
            await this.m_Thread.sleep(option.sleepRange);
        }

        return null;
    }
}
