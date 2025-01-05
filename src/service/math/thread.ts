import { ThreadBase } from '../../contract';

export class MathThread extends ThreadBase {
    public async sleep(range: [number, number]) {
        range.sort();
        await new Promise((s, f) => {
            try {
                const randomInt = Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
                setTimeout(() => {
                    s(null);
                }, Math.max(0, randomInt));
            } catch (error) {
                f(error);
            }
        });
    }
}
