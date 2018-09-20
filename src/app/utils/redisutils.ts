
import { RedisNode } from '../models/redis-node';

export const searchFilterNodes = (nodes: Array<RedisNode>, query: string) => {
    if (!query) {
        return nodes;
    }
    const searchRes = [];
    for (let i = 0; i < nodes.length; i++) {
        const node: RedisNode = nodes[i];
        const res = recursiveSearchNode(node, query);
        if (res) {
            searchRes.push(res);
        }
    }
    return searchRes;
};
export const recursiveSearchNode = (node: RedisNode, query: string): RedisNode => {
    const newNode: RedisNode = Object.assign({}, node);
    if (node.key.includes(query)) {
        return newNode;
    }
    if (node.children) {
        newNode.children = [];
        for (let i = 0; i < node.children.length; i++) {
            const childNode = node.children[i];
            const res = recursiveSearchNode(childNode, query);
            if (res) {
                newNode.children.push(res);
            }
        }
        if (newNode.children.length > 0) {
            return newNode;
        }
    }
    return;
};

