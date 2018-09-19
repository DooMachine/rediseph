const _ = require('lodash');

/**
 * build redis key tree
 * @param redis the redis instance
 */
async function buildRedisTree(redis) {
    if (!redis) {
      throw errors.newBadRequestError("Redis instance not exist");
    }  
    const root = {};
    const keys = await redis.keys('*');
    const lencommands = {
      list: 'llen',
      set: 'scard', 
      zset: 'zcard',
      hash: 'hlen',
    };
  
    for (let i = 0; i < keys.length; i++) { // process types
      const key = keys[i];
      const type = await redis.type(key);
      console.log(type)
      root[key] = {type};
      if (type !== 'string') {
        if (lencommands[type]) {
          root[key].len = await redis[lencommands[type]](key);
        }
      } else {
        root[key].value = await redis.get(key);
      }
    }
  
    const tree = {};
  
    const buildTree = (node, parts) => {
  
      const key = parts[0] + (parts.length === 1 ? '' : ':');
      node.children[key] = node.children[key] || {
        key: node.key + key,
        name: key + (parts.length === 1 ? '' : '*'),
        children: {},
      };
      if (parts.length > 1) {
        buildTree(node.children[key], parts.slice(1));
      }
    };
  
    const parseTreeToArray = (node, depth) => {
  
      if (_.keys(node.children).length <= 0) {
        return {key: node.key, ...root[node.key], name: node.name, depth}
      }
      const result = {
        type: 'folder',
        key: node.key,
        name: node.name,
        depth,
        children: []
      };
      _.each(node.children, (n) => {
        result.children.push(parseTreeToArray(n));
      });
      return result;
    };  
  
    const newRoot = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
  
      const parts = keys[i].split(':');
      if (parts.length <= 1) {
        newRoot.push({key, ...root[key], depth: 1, name: key})
      } else {
        if (!tree[parts[0]]) {
          tree[parts[0]] = {key: parts[0] + ':', children: {}, name: parts[0] + ':*'};
          newRoot.push(tree[parts[0]]);
        }
        buildTree(tree[parts[0]], parts.slice(1))
      }
    }
  
    for (let i = 0; i < newRoot.length; i++) {
      const v = newRoot[i];
      if (v.children) {
        newRoot[i] = parseTreeToArray(v, 1);
      }
    }  
    return newRoot;
  }

  

  const refreshNeedCommands = ['set',
  'del','hmset','hset','hdel',
  'append','decr','exec','expire',
  'flushall','flushdb','hincrby','hincrbyfloat','hsetnx',
  'incr','incrby','incrbyfloat','linsert','lpop','lpush','lpushx',
  'lrem','lset','ltrim','migrate','move','mset','msetnx','publish','rename','renamenx',
  'restore','rpush','rpushx','sadd','sdiff','setnx','sinter','smove','srem','sunion','sunionstore',
  'zadd','zincrby','zinterstore','zpopmax','zpopmin','zrem','zrank','xadd']

  module.exports = {
    buildRedisTree, refreshNeedCommands
  }