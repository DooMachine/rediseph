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
        pipeline.type(key, (_,type)=> {
          keyRoot[fetchkeys[i]] = { type:type }
        })

        pipeline.pttl(key,(_,exp) => {
          keyRoot[fetchkeys[i]].exp = exp;
        });
      }
      await pipeline.exec()      
      await callback(keyRoot, newCursor); 
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
async function handleMonitorCommands (redisInstance,monitorCommands, callback) {
  let ioActions = [];
  for (let c = 0; c < monitorCommands.length; c++) {
    const args = monitorCommands[c];
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
        ioActions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
      }    
    }
    else if(command === 'set') {
      if(args.length == 3) {
        key = args[1];
        const keyObj = redisInstance.keys[key];
        if(keyObj) {
          selectedKey = redisInstance.selectedKeyInfo.find(p=>p.key === key);
          if (selectedKey) {
            selectedKey.value= await redisInstance.redis.get(key);
            selectedKey.exp = await redisInstance.redis.pttl(key);
            ioActions.push({type: monitoractions.SELECTED_NODE_UPDATED, key: key})
          }
        } else {
          const newValue = {
            type : 'string'
          }
          redisInstance.keys[key] = newValue;
          ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
        }
      }   
    } else if (shouldRemoveTreeCommands.indexOf(command) != -1) {
      redisInstance.keys = {};
      ioActions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
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
            ioActions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
          }
        }
      } else if (command == 'rename') {
        key = args[1];
        newKey = args[2];
        const existingnewKey = await redisInstance.redis.get(newKey);
        const keyObj = redisInstance.keys[key];
        if(keyObj) {
          if (!existingnewKey) {
              redisInstance.keys[newKey] = redisInstance.keys[key];
              delete redisInstance.keys[key];
              ioActions.push({type:  monitoractions.UPDATE_LOCAL_TREE})
          }
        }
      }    
    }
  }  
  return callback(ioActions);
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
            nextActions.push({type: cmdactions.SET_KEY, payload:{key: args[0], value: args[1]}})
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
        let shouldUpdateLocalTree = false;
        let shouldUpdateSelectedNodes = false;
        for (let i = 0; i < action.payload.keys.length; i++) {
          const delkey = action.payload.keys[i];
          localKey = redisInstance.keys[delkey];
          if(localKey) {
            delete redisInstance.keys[delkey];
            shouldUpdateLocalTree = true;
          }
          if(redisInstance.selectedKeyInfo.findIndex(p=>p.key == delkey) != -1) {
            shouldUpdateSelectedNodes = true;
            redisInstance.selectedKeyInfo = redisInstance.selectedKeyInfo.filter(p=>p.key != delkey);
          }
        }
        if (shouldUpdateLocalTree) {          
          ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
        }
        if(shouldUpdateSelectedNodes) {          
          ioActions.push({type: monitoractions.SELECTED_NODES_UPDATED})
        }
        break;
      case cmdactions.SET_KEY:
        selectedKey = redisInstance.selectedKeyInfo.find(p=>p.key === action.payload.key);
        if (selectedKey) {
          selectedKey.value= await redisInstance.redis.get(action.payload.key);
          selectedKey.exp= await redisInstance.redis.pttl(action.payload.key);
          ioActions.push({type: monitoractions.SELECTED_NODE_UPDATED, key: action.payload.key})
        } else {
          const treeKey = redisInstance.keys[action.payload.key];
          if (!treeKey) {
            redisInstance.keys[action.payload.key] = {
              type: 'string',
              exp: await redisInstance.redis.pttl(action.payload.key)
            }
            ioActions.push({type: monitoractions.UPDATE_LOCAL_TREE})
          } 
        }
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
  return ioActions;
}

async function addNewKey(redisInstance, model, callback) {
  // export enum DataType {
  //   string = 'String', list = 'List', set = 'Set', hashmap = 'Hash Map', sortedset = 'Sorted Set'
  // }
  const typeMap = {
    'String': 'string',
    'Hash Map': 'hash',
    'List': 'list',
    'Sorted Set': 'zset',
    'Set': 'set'
  }
  const newType = typeMap[model.type];
  let ioActions = [
      {type: monitoractions.UPDATE_LOCAL_TREE}
    ];
  const pipeline = redisInstance.redis.pipeline();
  if (newType==='string')
  {
    pipeline.set(model.key, "Modify This Value").get(model.key).exec(async (e,res) => {      
      redisInstance.keys[model.key] = {type: newType}
      const newKeyInfo = {
        key: model.key,
        type: 'string',
        value: res[1][1],
      }
      redisInstance.selectedKeyInfo.push(newKeyInfo)
      ioActions.push({type: monitoractions.NEW_KEY_ADDED, keyInfo: newKeyInfo })   
      callback(ioActions);   
    })
  }
  else if(newType == 'list')
  {
    redisInstance.redis.lpush(model.key, 'Modify This Value', async (e,res) => {
      
      redisInstance.keys[model.key] = {type: newType}
      const newKeyInfo = {
        type: newType,
        key: model.key,
        keyScanInfo: {
          entities: [],
          pageSize: 20,
          pageIndex: 0,
          hasMoreEntities: false,    
      }};
      redisInstance.redis.lrange(model.key,0,19, async (err,resp) => {
        newKeyInfo.keyScanInfo.entities = resp;
        redisInstance.selectedKeyInfo.push(newKeyInfo)
        ioActions.push({type: monitoractions.NEW_KEY_ADDED, keyInfo:newKeyInfo })
        callback(ioActions);     
      }); 
    })
  }
  else if(newType == 'set' || newType == 'hash' || newType == 'zset')
  {
    const commandMap = {
      set: 'sadd',
      hash: 'hset',
      zset: 'zadd',
    }
    const addLine = [model.key]
    if(newType == 'zset') {
      addLine.push(1)
    }
    if(newType == 'hash') {
      addLine.push("my_key")
    }
    addLine.push("my_value");
    redisInstance.redis.call(commandMap[newType],addLine, async (e,res) => { 
      redisInstance.keys[model.key] = {type: newType}
      const newKeyInfo = {
        key: model.key,
        type: newType,
        keyScanInfo: {
          entities : [],
          pageSize: 20,
          pageIndex: 0,
          cursor: "",
          pattern:"*",
          hasMoreEntities: false,            
      }}
      const SCAN_TYPE_MAP = {
        set:'sscan',
        hash:'hscan',
        zset:'zscan'
      }
      const scanMethod = SCAN_TYPE_MAP[newType];
      redisInstance.redis[scanMethod](model.key, "0",'MATCH', "*", 'COUNT', 20, async (err, [cursor, resp]) => {         
        newKeyInfo.keyScanInfo.entities = resp; 
        newKeyInfo.keyScanInfo.cursor = cursor;
        redisInstance.selectedKeyInfo.push(newKeyInfo);
        ioActions.push({type: monitoractions.NEW_KEY_ADDED, keyInfo: newKeyInfo })
        callback(ioActions);
      });
    })
  }
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
    addNewKey,
    handleListEntityScan,
    handleMonitorCommands,
    handleCommandExecution,
    handleCmdOutputActions
  }