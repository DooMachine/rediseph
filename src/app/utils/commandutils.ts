import { RedisNode } from '../models/redis-node';
import { NewEntityModel } from '../models/redis';

export const recursiveSpreadNodes = (node: RedisNode) => {
    let keys = [];
    if (node.type !== 'folder') {
        keys.push(node.key);
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            keys = [...keys, recursiveSpreadNodes(node.children[i])];
        }
    }
    return keys;
};

export const buildSETQuery = (info: any): Array<any> => {
    return [['set', [info.keyInfo.key , info.value]]];
};
export const buildDELQuery = (node: RedisNode ): Array<any> => {
    return [['del', recursiveSpreadNodes(node)]];
};
export const buildNewEntityQuery = (model: NewEntityModel): Array<any> => {
    const args = [];
    const lineArgs = [];
    const cmdArgs = [];
    switch (model.formType) {
        case 'set':
        {
            lineArgs.push('sadd');
            cmdArgs.push(model.key);
            cmdArgs.push(model.addValue);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'hash':
        {
            // maybe hset?
            lineArgs.push('hmset');
            cmdArgs.push(model.key);
            cmdArgs.push(model.addValue);
            cmdArgs.push('Edit this');
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'zset':
        {
            lineArgs.push('zadd');
            cmdArgs.push(model.key);
            cmdArgs.push(model.score);
            cmdArgs.push(model.addValue);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'list':
        {
            if (model.listAddType === 'head') {
                lineArgs.push('lpush');
            } else {
                lineArgs.push('rpush');
            }
            cmdArgs.push(model.key);
            cmdArgs.push(model.addValue);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        default:
            break;
    }
    return args;
};
export const buildDeleteFromNodeQuery = (info: any) => {
    const args = [];
    const lineArgs = [];
    const cmdArgs = [];
    switch (info.keyInfo.type) {
        case 'zset':
        {
            lineArgs.push('zrem');
            cmdArgs.push(info.keyInfo.key);
            cmdArgs.push(info.entity.value);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'set':
        {
            lineArgs.push('srem');
            cmdArgs.push(info.keyInfo.key);
            cmdArgs.push(info.entity.value);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'hash':
        {
            lineArgs.push('hdel');
            cmdArgs.push(info.keyInfo.key);
            cmdArgs.push(info.entity.hash);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        default:
            break;
    }
    return args;
};

export const buildLREMQuery = (result: any): Array<any> =>  {
    return [['lrem', [result.key , result.count, result.value]]];
};
