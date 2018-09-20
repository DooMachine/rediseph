const _ = require('lodash');
const monitoractions = require('./monitoractions');

async function scanRedisTree(redisInstance, cursor, pattern = '*', fetchCount = 100, callback) {
  if (pattern == '')
  {
    pattern = '*';
  }
  async function iter () {
    const keyRoot = {};
    const stream = redisInstance.redis.scanStream({
      cursor: cursor,
      match:pattern || '*',
      count:fetchCount,
    });
    const lencommands = {list: 'llen',set: 'scard', zset: 'zcard',hash: 'hlen', };

    stream.on('data', async (keys) => {      
      for (let i = 0; i < keys.length; i++) { // process types
        const key = keys[i];
        const type = await redisInstance.redis.type(key);
        keyRoot[key] = {type};
        if (type !== 'string') {
          if (lencommands[type]) {
            keyRoot[key].len =  await redisInstance.redis[lencommands[type]](key);
          }
        } else {
          keyRoot[key].value = await  redisInstance.redis.get(key);
        }
      }
      callback(keyRoot);
    });    
  }
  await iter();
}

async function handleMonitorCommand (redisInstance,args, callback) {
  let actions = [];
  command = args[0].toLowerCase();
  if(command === 'del') {
    keys = args.splice(1);
    let localTreeUpdated = false;
    for (let i = 0; i < keys.length; i++) {
      const keyObj = redisInstance.keys[keys[i]];
      if(keyObj) {
        localTreeUpdated = true;
        delete redisInstance.keys[keys[i]];
      }
    }      
    if (localTreeUpdated) {
      actions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
    }    
  }
  else if(command === 'set') {
    if(args.length != 3) {
      key = args[1];
      const keyObj = redisInstance.keys[key];
      if(keyObj) {
        keyObj.value = args[2]
        actions.push({type: monitoractions.UPDATE_LOCAL_TREE})
      } else {
        const newValue = {
          value : args[2],
          type : 'string'
        }
        redisInstance.keys[key] = newValue;
        actions.push({type: monitoractions.UPDATE_LOCAL_TREE})
      }
    }      
  } else if (shouldRemoveTreeCommands.indexOf(command) != -1) {
    redisInstance.keys = {};
    actions.push({type:  monitoractions.REMOVE_LOCAL_TREE})
  } else if (shouldTreeScanCommands.indexOf(command) != -1) {
    if (command == 'renamenx') {      
      key = args[1];
      newKey = args[2];
      const existingnewKey = await redisInstance.redis.get(newKey);
      if (!existingnewKey) {
        const keyObj = redisInstance.keys[key];
        if(keyObj) {
          redisInstance.keys[newKey] = redisInstance.keys[key];
          delete redisInstance.keys[key];
          actions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
        }
      }
    }else if (command == 'rename') {
      key = args[1];
      newKey = args[2];
      const existingnewKey = await redisInstance.redis.get(newKey);
      const keyObj = redisInstance.keys[key];
      if(keyObj) {
        if (!existingnewKey) {
            redisInstance.keys[newKey] = redisInstance.keys[key];
            delete redisInstance.keys[key];
            actions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
        }
      }
    }
  }
  callback(actions);
}


const shouldRemoveTreeCommands = [
  'flushall','flushdb',
]
const shouldTreeScanCommands = [
  'rename','renamenx','zinterstore'
]
const shouldHashScanCommands = [
  'hset','hsetnx','hmset'
]
const shouldSetScanCommands = [
  'sadd','srem','sort','smove'
]
const shoulListScanCommands = [
  'lset','lrem','lpush','lpushx','lpop','linsert','ltrim','rpop','rpush','rpushx','rpoplpush' ,'sort'
]
const shouldSortedSetScanCommands = [
  'zrem','zadd','zincrby','zpopmax','zpopmin','zremrangebylex',
  'zremrangebyrank','zremrangebyscore','sort'
]

const refreshNeedCommands = ['set',
'del','hmset','hset','hdel',
'append','decr','exec','expire',
'flushall','flushdb','hincrby','hincrbyfloat','hsetnx',
'incr','incrby','incrbyfloat','linsert','lpop','lpush','lpushx',
'lrem','lset','ltrim','migrate','move','mset','msetnx','publish','rename','renamenx',
'restore','rpush','rpushx','sadd','sdiff','setnx','sinter','smove','srem','sunion','sunionstore',
'zadd','zincrby','zinterstore','zpopmax','zpopmin','zrem','zrank','xadd']

  module.exports = {
    refreshNeedCommands, scanRedisTree, handleMonitorCommand
  }