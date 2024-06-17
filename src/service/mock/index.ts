import { deepStrictEqual } from 'assert';

class Record {
    public args: any[] = [];

    public returnValues: any[] = [];
}

export const mockAny: any = new Object();

export class Mock<T> {
    private m_CurrentKey: string;
    private m_Records: { [key: string]: Record; } = {};

    private m_Actual: any;
    public get actual() {
        this.m_Actual ??= new Proxy(this.m_Target, {
            get: (target: any, key: string) => {
                if (key in target)
                    return target[key];

                if (key == 'then')
                    return null;

                return (...args: any[]) => {
                    const record = this.m_Records[key];
                    if (!record?.args?.length)
                        throw new Error(key + '未被调用');

                    const recordArgs = record.args.shift();
                    deepStrictEqual(
                        args.map((r, i) => {
                            return recordArgs[i] == mockAny ? mockAny : r;
                        }),
                        recordArgs
                    );
                    return record.returnValues.shift();
                };
            }
        });
        return this.m_Actual as T;
    }

    public constructor(
        private m_Target = {}
    ) { }

    private m_Except = new Proxy({}, {
        get: (_, key: string) => {
            this.m_CurrentKey = key;
            if (!this.m_Records[key])
                this.m_Records[key] = new Record();

            return (...args: any[]) => {
                this.m_Records[key].args.push(args);
            };
        }
    });
    public get except() {
        return this.m_Except as T;
    }

    public exceptReturn(action: (t: T) => any, returnValue: any) {
        action(this.except);
        this.m_Records[this.m_CurrentKey].returnValues.push(returnValue);
    }
}