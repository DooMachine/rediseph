export interface RedisCli {
    redisId: string;
    redisHostName: string;
    lines: Array<string>;
    isLoading: boolean;
    showCli: boolean;
}
