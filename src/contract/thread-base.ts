export abstract class ThreadBase {
    public abstract sleep(range: [number, number]): Promise<void>;
}