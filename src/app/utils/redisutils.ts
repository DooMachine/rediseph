
import { RedisNode } from '../models/redis-node';
import * as _ from 'lodash';
import { SelectedKeyInfo } from '../models/redis';

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

export const buildRedisTree = (root) => {

    const tree = {};
    const keys = Object.keys(root);
    const buildTree = (node, parts) => {

      const key = parts[0] + (parts.length === 1 ? '' : ':');
      node.children[key] = node.children[key] || {
        key: node.key + key,
        displayName: key + (parts.length === 1 ? '' : '*'),
        children: {},
      };
      if (parts.length > 1) {
        buildTree(node.children[key], parts.slice(1));
      }
    };

    const parseTreeToArray = (node) => {

      if (_.keys(node.children).length <= 0) {
        return {key: node.key, ...root[node.key], displayName: node.displayName};
      }
      const result = {
        type: 'folder',
        key: node.key,
        displayName: node.displayName,
        children: []
      };
      _.each(node.children, (n) => {
        result.children.push(parseTreeToArray(n));
      });
      return result;
    };
    const nodeTree = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const parts = keys[i].split(':');
      if (parts.length <= 1) {
        nodeTree.push({key, ...root[key], depth: 1, displayName: key});
      } else {
        if (!tree[parts[0]]) {
          tree[parts[0]] = {key: parts[0] + ':', children: {}, displayName: parts[0] + ':*'};
          nodeTree.push(tree[parts[0]]);
        }
        buildTree(tree[parts[0]], parts.slice(1));
      }
    }

    for (let i = 0; i < nodeTree.length; i++) {
      const v = nodeTree[i];
      if (v.children) {
        nodeTree[i] = parseTreeToArray(v);
      }
    }
    return nodeTree;
  };

export const buildEntityModel = (keyInfo: SelectedKeyInfo) => {
  const fixedEntities = [];
  if (keyInfo.type === 'zset') {
    for (let i = 0; i < keyInfo.keyScanInfo.entities.length - 1; i += 2) {
      fixedEntities.push({value:  keyInfo.keyScanInfo.entities[i], score:  keyInfo.keyScanInfo.entities[i + 1]});
    }
  } else if (keyInfo.type === 'set') {
    for (let i = 0; i < keyInfo.keyScanInfo.entities.length; i++) {
      fixedEntities.push({value: keyInfo.keyScanInfo.entities[i]});
    }
  } else if (keyInfo.type === 'list') {
    for (let i = 0; i < keyInfo.keyScanInfo.entities.length; i++) {
      fixedEntities.push({value: keyInfo.keyScanInfo.entities[i]});
    }
  } else if (keyInfo.type === 'hash') {
    for (let i = 0; i < keyInfo.keyScanInfo.entities.length - 1; i += 2) {
      fixedEntities.push({value: keyInfo.keyScanInfo.entities[i + 1], hash: keyInfo.keyScanInfo.entities[i]});
    }
  }
  return fixedEntities;
};
