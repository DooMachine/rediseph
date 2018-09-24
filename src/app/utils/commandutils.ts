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
export const buildNewEntityQuery = (model: NewEntityModel) => {
    const args = [[]];
    switch (model.formType) {
        case 'set':
        {
            const lineArgs = [];
            lineArgs.push('sadd');
            const cmdArgs = [];
            cmdArgs.push(model.key);
            cmdArgs.push(model.addValue);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'hset':
        {
            const lineArgs = [];
            // maybe hset?
            lineArgs.push('hmset');
            const cmdArgs = [];
            cmdArgs.push(model.key);
            cmdArgs.push(model.addValue);
            cmdArgs.push('Edit this');
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'zset':
        {
            const lineArgs = [];
            lineArgs.push('zadd');
            const cmdArgs = [];
            cmdArgs.push(model.key);
            cmdArgs.push(model.score);
            cmdArgs.push(model.addValue);
            lineArgs.push(cmdArgs);
            args.push(lineArgs);
            break;
        }
        case 'list':
        {
            const lineArgs = [];
            if (model.listAddType === 'head') {
                lineArgs.push('lpush');
            } else {
                lineArgs.push('rpush');
            }
            const cmdArgs = [];
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
