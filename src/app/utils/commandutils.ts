import { RedisNode } from '../models/redis-node';

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
    return [['SET', [info.keyInfo.key , info.value]]];
};
export const buildDELQuery = (node: RedisNode ): Array<any> => {
    return [['DEL', recursiveSpreadNodes(node)]];
};
