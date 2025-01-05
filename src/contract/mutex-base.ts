export type MutexOption = {
    /**
     * 锁的key
     */
    key: string;
    /**
     * 锁的超时时间，单位秒
     */
    timeoutSeconds?: number;
    /**
     * 等待所尝试次数
     */
    tryCount?: number;
    /**
     * 等待锁的重试时间范围，单位毫秒
     */
    sleepRange?: [number, number];
};

type Unlock = () => Promise<void>;

export abstract class MutexBase {
    public abstract lock(option: MutexOption): Promise<Unlock>;

    public abstract waitLock(option: MutexOption): Promise<Unlock>;
}
