const _ = require('lodash');
const ioActions = require('./ioactions');
const cmdactions = require('./cmdactions');

const SCAN_TYPE_MAP = {
  set:'sscan',
  hash:'hscan',
  zset:'zscan'
}


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
  
  
  async function iterEntityScanNext () {

    const scanMethod = SCAN_TYPE_MAP[type];

    redisInstance.redis[scanMethod](key, cursor,
      'MATCH', pattern,
      'COUNT', fetchCount,
      async (err, [cursor, resp]) => {      
        await callback(resp, cursor); 
    });
  }
  await iterEntityScanNext();
}
async function handleListEntityScan(redisInstance,keyInfo, callback) {

  const start = keyInfo.keyScanInfo.pageIndex* keyInfo.keyScanInfo.pageSize;
  const end = start + keyInfo.keyScanInfo.pageSize -1;
  redisInstance.redis.lrange(keyInfo.key, start, end, async (err,resp) => {
    await callback(resp);
  })
}
async function handleMonitorCommands (redisInstance,monitorCommands, ioActionCallback) {
  let nextIoActions = [];
  let nextCmdActions = [];
  let shouldSkipNextCmdActions = false;
  for (let c = 0; c < monitorCommands.length; c++) {
    const args = monitorCommands[c];
    command = args[0].toLowerCase();
    if(command === 'del') {
      const keys = args.splice(1);
      nextCmdActions.push({type:  cmdactions.DEL_KEYS, payload:{keys: keys}});
    } else if(command === 'set') {
      if(args.length == 3) {
        const key = args[1];
        nextCmdActions.push({type: cmdactions.SET_KEYS, payload:{ keys: [key]}})          
      }   
    } else if (command == 'renamenx' || command == 'rename') {      
      nextCmdActions.push(cmdactions.SCAN_TILL_CURRENT_CURSOR);
    } else if (command == 'lpush') {
      key = args[1];
      const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == key);
      if (selectedKey) {
        nextCmdActions.push({type: cmdactions.ADD_SINGLE_FROM_LIST_HEAD, payload: {key: key}})
      }
    } else if (command == 'rpush') {
      key = args[1];
      const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == key);
      if (selectedKey) {
        nextCmdActions.push({type: cmdactions.ADD_SINGLE_FROM_LIST_TAIL, payload: {key: key}})
      }
    } else if (command == 'hmset' || command == 'hset' || command == 'zset' || command == 'sadd') {
      key = args[1];
      const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == key);
      if (selectedKey) {
        nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: key}})
      }
    } else if (shouldRemoveTreeCommands.indexOf(command) != -1) {
        redisInstance.keys = {};
        redisInstance.selectedKeyInfo = [];
        shouldSkipNextCmdActions = true;
        nextIoActions.push({type:  ioActions.UPDATE_LOCAL_TREE})
        nextIoActions.push({type:  ioActions.SELECTED_NODES_UPDATED})
    }    
  }
  if (shouldSkipNextCmdActions) {
    return ioActionCallback(nextIoActions);
  }
  const fromCommandIoActions = await handleCmdOutputActions(redisInstance,nextCmdActions);
  console.log(fromCommandIoActions);
  return ioActionCallback([...nextIoActions,...fromCommandIoActions]);
}

async function handleCommandExecution(redisInstance,commands, callback) {
  let nextCmdActions = [];
  let nextIoActions = [];
  console.log("COMMADS =")
  console.log(commands);
  const pipeline = redisInstance.redis.pipeline();
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i][0].toLowerCase();
    const args = commands[i][1];
    console.log(args);
    switch (cmd) {
      case 'del':
      {
        pipeline.del(args,(err,result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.DEL_KEYS, payload: {keys: args}})
          }
        })
        break;
      }        
      case 'set':
      {
        pipeline.set(args[0],args[1] ,(err,result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.SET_KEY, payload:{key: args[0], value: args[1]}})
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
            nextCmdActions.push({type: cmdactions.SET_KEYS, payload: {keys: newKeys}})
          }
        })
        break;
      }
      case 'sadd':
      {
        const cmdArgs = args.splice(1);
        pipeline.sadd(args[0],cmdArgs, async (e, result) => {          
          if(result) {
            nextCmdActions.push({type: cmdactions.GET_NEXT_SCAN_ENTITY, payload: {key: args[0], pattern: cmdArgs[0]+'*'}})
          }
          else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'zadd':
      {
        const cmdArgs = args.splice(1);
        pipeline.zadd(args[0],cmdArgs, async (e, result) => {
          if(result) {
            nextCmdActions.push({type: cmdactions.GET_NEXT_SCAN_ENTITY, payload: {key: args[0], pattern: cmdArgs[1]+'*'}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'hmset':
      {
        const cmdArgs = args.splice(1);
        pipeline.hmset(args[0],cmdArgs, async (e, result) => {
          if(result) {
            nextCmdActions.push({type: cmdactions.GET_NEXT_SCAN_ENTITY, payload: {key: args[0], pattern: cmdArgs[0]+'*'}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'lpush':
      {
        const cmdArgs = args.splice(1);
        pipeline.lpush(args[0],cmdArgs, async (e, result) => {
          if(result) {
            nextCmdActions.push({type: cmdactions.ADD_SINGLE_FROM_LIST_HEAD, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }   
      case 'rpush':
      {
        const cmdArgs = args.splice(1);
        pipeline.rpush(args[0],cmdArgs, async (e, result) => {
          if(result) {
            nextCmdActions.push({type: cmdactions.ADD_SINGLE_FROM_LIST_TAIL, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'zrem':
      {
        const cmdArgs = args.splice(1);
        pipeline.zrem(args[0], cmdArgs, async (e, result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'srem':
      {
        const cmdArgs = args.splice(1);
        pipeline.srem(args[0], cmdArgs, async (e, result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'hdel':
      {
        const cmdArgs = args.splice(1);
        pipeline.hdel(args[0], cmdArgs, async (e, result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'lrem':
      {
        const cmdArgs = args.splice(1);
        pipeline.lrem(args[0], cmdArgs, async (e, result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
        break;
      }
      case 'lset':
      {
        const cmdArgs = args.splice(1);
        pipeline.lset(args[0], cmdArgs, async (e, result) => {
          if (result) {
            nextCmdActions.push({type: cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT, payload: {key: args[0]}})
          } else 
          {
            nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: e})
          }
        })
      }
      default:
        break;
    }
  }  
  await pipeline.exec( async (_, results) => {
    let cmdOutIoActions = [];
    if (nextCmdActions.length && !redisInstance.isMonitoring) {
      cmdOutIoActions = await handleCmdOutputActions(redisInstance, nextCmdActions);
    }
    callback([...nextIoActions,...cmdOutIoActions ]); 
  })
}

async function handleCmdOutputActions(redisInstance, actions) {
  console.log("coutpo");
  console.log(actions);
  let nextIoActions = [];
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    switch (action.type) {
      case cmdactions.DEL_KEYS:
      {
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
          nextIoActions.push({type: ioActions.UPDATE_LOCAL_TREE})
        }
        if(shouldUpdateSelectedNodes) {          
          nextIoActions.push({type: ioActions.SELECTED_NODES_UPDATED})
        }
        break;
      }
      case cmdactions.SET_KEY:
      {
        selectedKey = redisInstance.selectedKeyInfo.find(p=>p.key === action.payload.key);
        if (selectedKey) {
          selectedKey.value= await redisInstance.redis.get(action.payload.key);
          selectedKey.exp= await redisInstance.redis.pttl(action.payload.key);
          nextIoActions.push({type: ioActions.SELECTED_NODE_UPDATED, keyInfo: selectedKey})
        } else {
          const treeKey = redisInstance.keys[action.payload.key];
          if (!treeKey) {
            redisInstance.keys[action.payload.key] = {
              type: 'string',
              exp: await redisInstance.redis.pttl(action.payload.key)
            }
            nextIoActions.push({type: ioActions.UPDATE_LOCAL_TREE})
          } 
        }
        break;
      }
      case cmdactions.SET_KEYS:
      {
        const newKeyAndTypes = {}
        for (let i = 0; i < action.payload.keys.length; i++) {
          const key = action.payload.keys[i];      
          newKeyAndTypes[key] = {type: 'string'}; 
          selectedKey = redisInstance.selectedKeyInfo.find(p=>p.key === key);
          if (selectedKey) {
            selectedKey.value= await redisInstance.redis.get(key);
            selectedKey.exp = await redisInstance.redis.pttl(key);
            ioActionextIoActionsns.push({type: ioActions.SELECTED_NODE_UPDATED, keyInfo: selectedKey})
          } 
        }
        redisInstance.keys = Object.assign({},redisInstance.keys,newKeyAndTypes);
        nextIoActions.push({type: ioActions.UPDATE_LOCAL_TREE})
        break;
      }
      case cmdactions.ADD_SINGLE_FROM_LIST_HEAD:
      {
        const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == action.payload.key)
        if (selectedKey) {
          await redisInstance.redis.lrange(
              action.payload.key,
              0,
              0,
            async (e,resp) => {
              selectedKey.keyScanInfo.entities = resp.concat(selectedKey.keyScanInfo.entities);
              selectedKey.keyScanInfo.selectedEntityIndex = 0;
              nextIoActions.push({
                type: ioActions.SELECTED_NODE_UPDATED,
                keyInfo: selectedKey, 
              });
          })
        }
        break;
      }
      case cmdactions.ADD_SINGLE_FROM_LIST_TAIL:
      {
        const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == action.payload.key)
        if (selectedKey) {
          await redisInstance.redis.lrange(
              action.payload.key,
              -1,
              -1,
            async (e,resp) => {
              selectedKey.keyScanInfo.entities.push(resp);
              selectedKey.keyScanInfo.selectedEntityIndex = selectedKey.keyScanInfo.entities.length -1;
              nextIoActions.push({type: ioActions.SELECTED_NODE_UPDATED,
                keyInfo: selectedKey,
              });
          })
        }
        break;
      }
      case cmdactions.GET_NEXT_SCAN_ENTITY:
      {
        const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == action.payload.key)
        if (selectedKey) {
          const scanMethod = SCAN_TYPE_MAP[selectedKey.type]
          await redisInstance.redis[scanMethod](
              selectedKey.key,
              selectedKey.keyScanInfo.cursor,
              'MATCH', action.payload.pattern,
              'COUNT', selectedKey.keyScanInfo.pageSize,
            async (e,[cursor,resp]) => {
              selectedKey.keyScanInfo.cursor  = cursor;    
              selectedKey.keyScanInfo.pattern = action.payload.pattern;         
              selectedKey.keyScanInfo.entities = resp;
              selectedKey.keyScanInfo.selectedEntityIndex = 0;
              nextIoActions.push({type: ioActions.SELECTED_NODE_UPDATED, keyInfo: selectedKey});
          })
        }
        break;
      }
      case cmdactions.REFRESH_TILL_CURRENT_ENTITY_COUNT:
      {
        const selectedKey = redisInstance.selectedKeyInfo.find(p => p.key == action.payload.key)
        if (selectedKey) {
          if(selectedKey.type == 'list') {
            await redisInstance.redis.lrange(action.payload.key,0,selectedKey.keyScanInfo.entities.length,
            async (e, resp) => {
              selectedKey.keyScanInfo.entities = resp;
              selectedKey.keyScanInfo.hasMoreEntities = false;
              nextIoActions.push({type: ioActions.SELECTED_NODE_UPDATED, keyInfo:selectedKey })
            });
          } else {
            const pattern = selectedKey.keyScanInfo.pattern == '' ? "*" : selectedKey.keyScanInfo.pattern;
            const scanMethod = SCAN_TYPE_MAP[selectedKey.type]
            await redisInstance.redis[scanMethod](
                selectedKey.key,
                "0",
                'MATCH', pattern,
                'COUNT', selectedKey.keyScanInfo.entities.length,
              async (e,[cursor,resp]) => {
                selectedKey.keyScanInfo.cursor  = cursor;           
                selectedKey.keyScanInfo.entities = resp;
                selectedKey.keyScanInfo.selectedEntityIndex = 0;
                nextIoActions.push({type: ioActions.SELECTED_NODE_UPDATED, keyInfo: selectedKey});
            })
          }
          break;
        }
      }
      default:
        break;
    }
  }
  return nextIoActions;
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
  let nextIoActions = [
      {type: ioActions.UPDATE_LOCAL_TREE}
    ];
  const pipeline = redisInstance.redis.pipeline();
  if (newType==='string')
  {
    await pipeline.set(model.key, "Modify This Value").get(model.key).exec(async (e,res) => {         
      redisInstance.keys[model.key] = {type: newType}
      const newKeyInfo = {
        key: model.key,
        type: 'string',
        value: res[1][1],
      }
      redisInstance.selectedKeyInfo.push(newKeyInfo)
      nextIoActions.push({type: ioActions.NEW_KEY_ADDED, keyInfo: newKeyInfo })   
      callback(nextIoActions);   
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
          selectedEntityIndex : 0,
          hasMoreEntities: false,    
      }};
      const start = (newKeyInfo.keyScanInfo.pageIndex * newKeyInfo.keyScanInfo.pageSize);
      const end = start + newKeyInfo.keyScanInfo.pageSize -1;
      await redisInstance.redis.lrange(model.key,start,end, async (err,resp) => {
        if( err ) {
          nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: err})
        } else {
          newKeyInfo.keyScanInfo.entities = resp;
          newKeyInfo.keyScanInfo.hasMoreEntities = false;
          redisInstance.selectedKeyInfo.push(newKeyInfo)
          nextIoActions.push({type: ioActions.NEW_KEY_ADDED, keyInfo:newKeyInfo })
        }
        callback(nextIoActions);
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
    await redisInstance.redis.call(commandMap[newType],addLine, async (e,res) => { 
      redisInstance.keys[model.key] = {type: newType}
      const newKeyInfo = {
        key: model.key,
        type: newType,
        keyScanInfo: {
          entities : [],
          pageSize: 20,
          pageIndex: 0,
          cursor: "0",
          pattern:"*",
          hasMoreEntities: false,            
      }}
      
      const scanMethod = SCAN_TYPE_MAP[newType];
      await redisInstance.redis[scanMethod](model.key, "0",'MATCH', "*", 'COUNT', 20, async (err, [cursor, resp]) => {
        console.log(err);
        if( err ) {
          nextIoActions.push({type: ioActions.ERROR_EXECUTING_COMMAND, error: err})
        } else {
          newKeyInfo.keyScanInfo.entities = resp;
          newKeyInfo.keyScanInfo.hasMoreEntities = false,
          newKeyInfo.keyScanInfo.cursor = cursor;
          redisInstance.selectedKeyInfo.push(newKeyInfo);
          nextIoActions.push({type: ioActions.NEW_KEY_ADDED, keyInfo: newKeyInfo })
        }     
        callback(nextIoActions);        
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