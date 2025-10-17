export enum ErrorCode {
    /**
     * 成功码
     */
    success = 0,
    /**
     * 服务器异常
     */
    serverInternal = 500,
    /**
     * API不存在
     */
    apiNotExists = 501,
    /**
     * 无效参数
     */
    invalidParams = 503,
}