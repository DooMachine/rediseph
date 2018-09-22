const _ = require('lodash');
const monitoractions = require('./monitoractions');
const cmdactions = require('./cmdactions');


async function scanRedisTree(redisInstance, cursor, pattern = '*', fetchCount = 100, callback) {
  if (pattern === "" || pattern == null)
  {
    pattern = '*';
  }
  console.log("s-1")
  async function scanNext () {
    const keyRoot = {};
    let newCursor = 0;

    redisInstance.redis.scan(cursor,'MATCH', pattern, 'COUNT', fetchCount, async (err, resp) => {
      newCursor = resp[0];
      fetchkeys = resp[1];
      const pipeline = redisInstance.redis.pipeline();
      
      for (let i = 0; i < fetchkeys.length; i++) { // process types
        const key = fetchkeys[i];
        pipeline.type(key);
      }
      pipeline.exec().then(async (keyTypes) => {
        for (let i = 0; i < fetchkeys.length; i++) {
          keyRoot[fetchkeys[i]] = { type: keyTypes[i][1] }          
        }
        await callback(keyRoot, newCursor); 
      })
    });
  }
  await scanNext();
}

async function scanKeyEntities(redisInstance,key, type, cursor, pattern = '*', fetchCount = 40, callback) {
  if (pattern === "" || pattern == null)
  {
    pattern = '*';
  }
  
  const SCAN_TYPE_MAP = {
    set:'sscan',
    hash:'hscan',
    zset:'zscan'
  }
  async function iterEntityScanNext () {

    const scanMethod = SCAN_TYPE_MAP[type];

    redisInstance.redis[scanMethod](key, cursor,'MATCH', pattern, 'COUNT', fetchCount, async (err, [cursor, resp]) => {
      
      await callback(resp, cursor); 
    });
  }
  await iterEntityScanNext();
}
async function handleListEntityScan(redisInstance,newSelectedKeyInfo, callback) {

  const start = newSelectedKeyInfo.keyScanInfo.pageIndex* newSelectedKeyInfo.keyScanInfo.pageSize;
  const end = start + newSelectedKeyInfo.keyScanInfo.pageSize -1;
  console.log(newSelectedKeyInfo.key, start, end)
  redisInstance.redis.lrange(newSelectedKeyInfo.key, start, end, async (err,resp) => {
    await callback(resp);
  })
}
async function handleMonitorCommand (redisInstance,args, callback) {
  let actions = [];
  console.log("s-5")
  console.log(new Date().getMilliseconds())
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
    if(args.length == 3) {
      key = args[1];
      const keyObj = redisInstance.keys[key];
      if(keyObj) {
        actions.push({type: monitoractions.UPDATE_LOCAL_TREE})
      } else {
        const newValue = {
          type : 'string'
        }
        redisInstance.keys[key] = newValue;
        actions.push({type: monitoractions.UPDATE_LOCAL_TREE})
      }
    }      
  } else if (shouldRemoveTreeCommands.indexOf(command) != -1) {
    redisInstance.keys = {};
    actions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
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
  console.log("s-9")
  }
  console.log("s-11")
  console.log(new Date().getMilliseconds())
  callback(actions);
}

async function handleCommandExecution(redisInstance,commands, callback) {
  let nextActions = [];
  const pipeline = redisInstance.redis.pipeline();
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i][0].toLowerCase();
    const args = commands[i][1];
    switch (cmd) {
      case 'del':
      {
        pipeline.del(args,(err,result) => {
          if (result) {
            nextActions.push({type: cmdactions.DEL_KEYS, payload: {keys: args}})
          }
        })
        break;
      }        
      case 'set':
      {
        pipeline.set(args[0],args[1] ,(err,result) => {
          if (result) {
            nextActions.push({type: cmdactions.SET_KEY, payload:{key: args[0]}})
          }
        })
        break;
      }        
      case 'mset':
      {
        const newKeys = [];
        const query = {};
        for (let i = 0, q= 1; i < args[0].length; i+=2, q+=2) {
          newKeys.push(args[0][i]);
          query[args[0][i]] = {type: args[0][q]};          
        }
        pipeline.set(query, (err,result) => {
          if (result) {
            nextActions.push({type: cmdactions.SET_KEYS, payload: {keys: newKeys}})
          }
        })
        break;
      }
      default:
        break;
    }
  }  
  pipeline.exec((_, results) => {
    callback(nextActions); 
  })
}

async function handleCmdOutputActions(redisInstance, actions) {
  let ioActions = [];
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    switch (action.type) {
      case cmdactions.DEL_KEYS:
        for (let i = 0; i < action.payload.keys.length; i++) {
          const delkey = action.payload.keys[i];
          redisInstance.newSelectedKeyInfo = redisInstance.newSelectedKeyInfo.filter(p=>p.key != delkey);
          delete redisInstance.keys[delkey];
        }
        ioActions.push({type: monitoractions.SELECTED_NODES_UPDATED,})
        ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
        break;
      case cmdactions.SET_KEY:
        redisInstance.keys[action.payload.key] = {type: 'string'}
        ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
        break;
      case cmdactions.SET_KEYS:
        const newKeyAndTypes = {}
        for (let i = 0; i < action.payload.keys.length; i++) {
          const key = action.payload.keys[i];      
          newKeyAndTypes[key] ={type: 'string'};  
        }
        redisInstance.keys = Object.assign({},redisInstance.keys,newKeyAndTypes);
        ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
        break;    
      default:
        break;
    }
  }
  return _.uniq(ioActions);
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
    refreshNeedCommands,
    scanRedisTree,
    scanKeyEntities,
    handleListEntityScan,
    handleMonitorCommand,
    handleCommandExecution,
    handleCmdOutputActions
  }