export enum ErrorCode {
    /**
     * 成功码
     */
    success = 0,
    /**
     * API不存在
     */
    apiNotExists = 501,
    /**
     * 无效参数
     */
    invalidParams = 503,
    /**
     * 服务器异常
     */
    serverInternal = 599
}