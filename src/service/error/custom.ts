export class CustomError extends Error {
    public constructor(
        public code: number,
        public data?: any
    ) {
        super(typeof data == 'string' ? data : JSON.stringify(data));
    }
}