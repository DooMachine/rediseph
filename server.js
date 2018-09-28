const express = require('express');
const socketio = require('socket.io');
const _ = require('lodash');
const uuid = require('uuid');
const Redis = require('ioredis');
const config = require('config');
const Rx = require('rxjs');
const rxop = require('rxjs/operators')

const redisutils = require('./library/redisutils')
const RedisInstance = require('./library/redisinstance')
const SelectedKeyInfo = require('./library/selectedkeyinfo');
const actions = require('./library/actions');
const ioActions = require('./library/ioactions');

const port = process.env.PORT || 3003;
const env = process.env.NODE_ENV || "development";

const app = express();

app.set('port', port);
app.set('env', env);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const router = express.Router();              

// TODO: Serve Angular APP
router.get('/', (req, res) => {
    res.json({ health: 'OK', ...db });
});

app.use('/', router);

const server = app.listen(app.get('port'), () => {
    console.log('Rediseph server listening on port ' + app.get('port'));
});

const io = socketio(server, {'origins': '*:*'} );

const db = {
    redisInstances: [],
};



io.on('connection', (client) => {
    /**
     * On Client tries to connect
     */
    client.on(actions.CONNECT_REDIS_INSTANCE, async (connectionInfo) => {
        // if we need multiple users make changes same time (like live chat)
        const diffrentEveryUser = config.get('DIFFERENT_CONNECTION_FOR_EVERY_USER');
        const previousConnectedRedis = db.redisInstances.find(p=> 
            p.connectionInfo.ip == connectionInfo.ip
            && p.connectionInfo.password == connectionInfo.password
            && p.connectionInfo.db == connectionInfo.db
            && p.connectionInfo.port == connectionInfo.port
            ) 
        if(!diffrentEveryUser && previousConnectedRedis != null) {
            console.log("CONNECTING SAME")
            connectionInfo.id = previousConnectedRedis.roomId;
            client.join(previousConnectedRedis.roomId);
            previousConnectedRedis.connectedClientCount++;
            client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                {
                    redisInfo: connectionInfo,
                    isMonitoring: previousConnectedRedis.isMonitoring,
                    keyInfo:previousConnectedRedis.keyInfo,
                    keys: previousConnectedRedis.keys,
                    serverInfo: previousConnectedRedis.redis.serverInfo,
                    selectedKeyInfo: previousConnectedRedis.selectedKeyInfo
                })
        } else {
            let roomId = uuid();
            connectionInfo.id = roomId;
            const redis = new Redis({
                host: connectionInfo.ip, port: connectionInfo.port, db: connectionInfo.db,
                password: connectionInfo.password,
                retryStrategy: (times) => {
                    var delay = Math.min(times * 50, 3000);
                    return delay;
                }
            });
            
            redis.on('error', async (e) => {           
                io.to(roomId).emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                    {redisInfo: connectionInfo, error: e})
                redis.disconnect();
                db.redisInstances = db.redisInstances.filter(p=>p.roomId != roomId);
            });
            redis.once('end', async ()=> {                
                io.to(roomId).emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                    {redisInfo: connectionInfo, error: 'Connection with redis server ENDED!'});
                db.redisInstances = db.redisInstances.filter(p=>p.roomId != roomId);
            })
          
            redis.on('ready', async () => {
                const version = redis.serverInfo.redis_version;
                if(version) {
                    const versionNo = parseInt(version[0]+version[2]);
                    if(versionNo < 28) {                    
                        redis.disconnect();
                        client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                            {
                                error:'This tool works with redis versions >= 2.8.X Yours is ' + version,
                                redisInfo: connectionInfo,
                            })
                            return;
                    }
                }
                const redisInstance = new RedisInstance(roomId, connectionInfo, redis);
                /**
                 * When we get commands, process them and send must done actions to iostreamer
                 */
                redisInstance.cmdStreamer.subscribe(async (actions) => {
                    
                })
                /**
                 * Get actions according to monitor or user commands, execute modifications to all redis users.
                 */
                redisInstance.ioStreamer.subscribe((acts)=> {
                    acts = _.uniqWith(acts, _.isEqual);
                    
                    for (let i = 0; i < acts.length; i++) {
                        const action = acts[i];
                        switch (action.type) {
                            /**
                             * Some commands(set,del,rename etc..) updated redis keys
                             */
                            case ioActions.UPDATE_LOCAL_TREE:
                            {
                                io.to(redisInstance.roomId).emit(actions.REDIS_INSTANCE_UPDATED,
                                {
                                    redisInfo: redisInstance.connectionInfo,
                                    isMonitoring: redisInstance.isMonitoring,
                                    keyInfo:redisInstance.keyInfo,
                                    keys: redisInstance.keys,
                                    serverInfo: redisInstance.redis.serverInfo,
                                });
                                break; 
                            }
                            /**
                             * Someone added new key to redis
                             */
                            case ioActions.NEW_KEY_ADDED:
                            {
                                io.to(redisInstance.roomId).emit(actions.NEW_KEY_ADDED,
                                {
                                    redisId: redisInstance.roomId,
                                    keyInfo: action.keyInfo
                                })
                                break;
                            }
                            /**
                             * When after some commands
                             * One of selected nodes updated
                             */
                            case ioActions.SELECTED_NODE_UPDATED: 
                            {
                                console.log("Selected Key Updated");
                                io.to(redisInstance.roomId).emit(actions.SELECTED_NODE_UPDATED,
                                    {
                                       redisId: redisInstance.roomId,
                                       keyInfo: action.keyInfo
                                   });
                                break;
                            }  
                            /**
                             * When Client Closes Key Tab
                             */
                            case ioActions.NODE_DESELECTED: 
                            {
                                console.log("Selected Key Deleted");
                                io.to(redisInstance.roomId).emit(actions.DESELECTED_NODE_SUCCESS,
                                    {
                                       redisId: redisInstance.roomId,
                                       key: action.key
                                   });
                                break;
                            }                        
                            case ioActions.SELECTED_NODES_UPDATED:
                            {
                                /**
                                 * Should we listen this in client? 
                                 */
                                console.log("Selected keys added/deleted/updated")
                                io.to(redisInstance.roomId).emit(actions.SELECTED_NODES_UPDATED,
                                     {
                                        redisId: redisInstance.roomId,
                                        selectedKeyInfo: redisInstance.selectedKeyInfo
                                    });       
                                break;
                            }          
                            case ioActions.ERROR_EXECUTING_COMMAND:
                            {
                                // Only sender should see error
                                client.emit(actions.ERROR_EXECUTING_COMMAND,
                                    {
                                        error: action.error,
                                    })
                            }                
                            default:
                                break;
                        }
                    }
                })
                /**
                 * Start scan with cursor 0
                 */
                redisutils.scanRedisTree(redisInstance,
                    redisInstance.keyInfo.cursor,
                    redisInstance.keyInfo.pattern,
                    redisInstance.keyInfo.pageSize,
                    async (keys, cursor) => {
                        redisInstance.keys = keys;
                        redisInstance.keyInfo.cursor = cursor;
                        redisInstance.keyInfo.pageIndex++;
                        redisInstance.keyInfo.hasMoreKeys = cursor !== "0";                      
                        db.redisInstances.push(redisInstance)
                        client.join(roomId)
                        client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                            {
                                redisInfo: connectionInfo,
                                isMonitoring: redisInstance.isMonitoring,
                                keyInfo:redisInstance.keyInfo,
                                keys: keys,
                                serverInfo: redis.serverInfo,
                                selectedKeyInfo: []
                            })
                });
            });
        }        
    });

    client.on(actions.ADD_NEW_KEY, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.payload.redisId)
        redisutils.addNewKey(redisInstance, data.payload, async (nextIoActions) => {
            redisInstance.ioStreamer.next(nextIoActions);
        })        
    });
    /**
     * Tell redis to MONITOR all commands in, process them and set ioStreamer.
     */
    client.on(actions.WATCH_CHANGES, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId)
        
        redisInstance.redis.monitor(async (err, monitor) => {
            redisInstance.isMonitoring = true;
            redisInstance.monitor = monitor;
            let storedArgs = [];
            // We Process monitor commands every 0.8 sec, because redis server may be busy.
            let interval$ = Rx.interval(800);
            interval$.subscribe((time) => {
                if (storedArgs.length) {
                    // duplicate to keep new commands while "handleMonitorCommands" handling processing.
                    const toCmdArgs = [...storedArgs];
                    storedArgs = [];
                    redisutils.handleMonitorCommands(redisInstance, toCmdArgs, async (nextActions) => {
                        redisInstance.ioStreamer.next(nextActions);
                    })
                }
            });            
            monitor.on('monitor', async (time, args, source, database) => {
                console.log("I Monitored")
                console.log(args);
                if (database === redisInstance.connectionInfo.db.toString()) {                    
                    storedArgs.push(args);
                }
            });
        });
        
        io.to(data.redisId).emit(actions.WATCHING_CHANGES,data.redisId)
    });
    /**
     * Stop MONITOR on redis, this activates cmdListener to make local changes. (e.g del, set, scan, refresh scan keys)
     */
    client.on(actions.STOP_WATCH_CHANGES, async (data) => {
        
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId)
        if(redisInstance.isMonitoring) {
            redisInstance.isMonitoring = false;
            if(redisInstance.monitor) {
                redisInstance.monitor.disconnect();
                delete redisInstance.monitor;
            }
        }        
        io.to(data.redisId).emit(actions.STOPPED_WATCH_CHANGES, data.redisId)
    });
    /**
     * Executing client commands
     */
    client.on(actions.EXECUTE_COMMAND, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        // if it is not monitoring we should take care of it        
        await redisutils.handleCommandExecution(redisInstance, data.args, (nextIoActions) => {         
            redisInstance.ioStreamer.next(nextIoActions);
        })
        
    });
    /**
     * Executing raw terminal commands
     */
    client.on(actions.EXECUTE_TERMINAL_LINE, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }      
        
        const args = data.line.replace(/\s\s+/g, ' ').split(' ');
        const cmdArgs = [...args];
        await redisutils.handleRawCommandExecution(redisInstance, args, async (err, resp) => {     
            const commanddate = new Date();    
            redisInstance.terminalInfo.lines.push(commanddate.toTimeString()+ '> '+ data.line);
            if(err) {
                redisInstance.terminalInfo.lines.push(err.message)                
            } else {
                redisInstance.terminalInfo.lines.push(resp);
            }
            io.to(data.redisId).emit(actions.EXECUTE_TERMINAL_LINE_RESPONSE, {
                redisId: data.redisId,
                terminalInfo: redisInstance.terminalInfo,
            });
            // if we are not monitoring we should next lines to subscriber.
            console.debug(redisInstance.isMonitoring);
            if (!redisInstance.isMonitoring) {
                redisutils.handleMonitorCommands(redisInstance, [cmdArgs], async (nextIoActions) => {
                    redisInstance.ioStreamer.next(nextIoActions);
                })
            }
        })
        
    });
    /**
     * When user searchs a pattern or key, set cursor 0 and scan with pattern.
     */
    client.on(actions.SET_SEARCH_QUERY, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisInstanceId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        redisInstance.keyInfo = {
            selectedKey: null,
            pattern: data.pattern,
            hasMoreKeys: false,
            cursor: "0",
            pageIndex: 0,
            previousCursors:[],
            pageSize: process.env.SCAN_PAGE_SIZE || 40
        };
        // first scan when search query changes
        redisutils.scanRedisTree(redisInstance,
            redisInstance.keyInfo.cursor,
            redisInstance.keyInfo.pattern,
            redisInstance.keyInfo.pageSize,
            async (keys, cursor) => {
                redisInstance.keys = keys;
                redisInstance.keyInfo.cursor = cursor;
                redisInstance.keyInfo.pageIndex++;
                redisInstance.keyInfo.hasMoreKeys = cursor !== "0";
                
                redisInstance.ioStreamer.next([{type: ioActions.UPDATE_LOCAL_TREE}]);
        })
    });
    /**
     * When users select key in client:
     * Fetch Values and display it to redis room.
     */
    client.on(actions.SET_SELECTED_NODE, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        // If user already selected
        if(redisInstance.selectedKeyInfo.find(p=>p.key==data.key)) {
            return;
        }
        const keyInfo = redisInstance.keys[data.key];
        const newSelectedKeyInfo = new SelectedKeyInfo(data.key,keyInfo.type,redisInstance.roomId);
        if(newSelectedKeyInfo.type === 'string') {
            newSelectedKeyInfo.value = await redisInstance.redis.get(newSelectedKeyInfo.key)
            redisInstance.selectedKeyInfo.push(newSelectedKeyInfo);
            redisInstance.ioStreamer.next([{type: ioActions.SELECTED_NODE_UPDATED, keyInfo:newSelectedKeyInfo}]);
        }
        else if(newSelectedKeyInfo.type === 'list') {
            redisutils.handleListEntityScan(redisInstance, newSelectedKeyInfo,
                async (entities) => {
                    newSelectedKeyInfo.keyScanInfo.entities = entities;
                    newSelectedKeyInfo.keyScanInfo.pageIndex++;
                    newSelectedKeyInfo.keyScanInfo.hasMorePage = entities.length == newSelectedKeyInfo.keyScanInfo.pageSize;
                    redisInstance.selectedKeyInfo.push(newSelectedKeyInfo);
                    redisInstance.ioStreamer.next([{type: ioActions.SELECTED_NODE_UPDATED, keyInfo:newSelectedKeyInfo}]);
                });
        }
        else if (keyInfo.type === 'set' || keyInfo.type === 'zset' || keyInfo.type === 'hash') {
            newSelectedKeyInfo.keyScanInfo.previousCursors.push("0");
            redisutils.scanKeyEntities(redisInstance, data.key, keyInfo.type,
                newSelectedKeyInfo.keyScanInfo.cursor,
                newSelectedKeyInfo.keyScanInfo.pattern,
                newSelectedKeyInfo.keyScanInfo.pageSize,
                async (entities, cursor) => {
                    newSelectedKeyInfo.keyScanInfo.entities = entities;
                    newSelectedKeyInfo.keyScanInfo.cursor = cursor;
                    newSelectedKeyInfo.keyScanInfo.pageIndex++;
                    newSelectedKeyInfo.keyScanInfo.hasMoreEntities = cursor != "0";
                    redisInstance.selectedKeyInfo.push(newSelectedKeyInfo);
                    redisInstance.ioStreamer.next([{type: ioActions.SELECTED_NODE_UPDATED, keyInfo:newSelectedKeyInfo}]);
            })
        }
        
        
    });

    /**
     * When users close key tab in client:
     * Remove From cache and update clients
     */
    client.on(actions.DESELECT_NODE_KEY, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        redisInstance.selectedKeyInfo = redisInstance.selectedKeyInfo.filter(p=>p.key !== data.key);
        redisInstance.ioStreamer.next([{type: ioActions.NODE_DESELECTED, key:data.key}]);

    });
    /**
     * Scan from last cursor with pagesize.
     * Then update clients.
     */
    client.on(actions.ITER_NEXT_PAGE_SCAN, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        // In case of refresh (Maybe after user start monitoring)
        redisInstance.keyInfo.previousCursors.push(redisInstance.keyInfo.cursor);  
        // iter from current cursor with pagesize
        redisutils.scanRedisTree(redisInstance,
            redisInstance.keyInfo.cursor,
            redisInstance.keyInfo.pattern,
            redisInstance.keyInfo.pageSize,
            async (keys, cursor) => {
                redisInstance.keys = {...redisInstance.keys,...keys};
                redisInstance.keyInfo.cursor = cursor;
                redisInstance.keyInfo.pageIndex++;
                redisInstance.keyInfo.hasMoreKeys = cursor !== "0";
                redisInstance.ioStreamer.next([{type: ioActions.UPDATE_LOCAL_TREE}])                
        })
    });
    client.on(actions.UPDATE_ENTITY_PAGINATION, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
            return;
        }
        // In case of refresh (Maybe after user start monitoring)
        const keyInfo = redisInstance.selectedKeyInfo.find(p => p.key === data.key);
        console.log(data);
        if(data.pattern || data.pattern == '') {
            console.log(data.pattern);
            keyInfo.keyScanInfo.pageIndex = 0;
            keyInfo.keyScanInfo.cursor = "0";
            keyInfo.keyScanInfo.pattern = data.pattern;
        }
        console.log(data);
        if (data.pageSize) {
            keyInfo.keyScanInfo.pageSize = data.pageSize;
        }
        if (data.pageIndex) {
            keyInfo.keyScanInfo.pageIndex = data.pageIndex;
        }
        if (keyInfo.type == 'list') {
            redisutils.handleListEntityScan(redisInstance, keyInfo, async (entities) => {
                keyInfo.keyScanInfo.entities = keyInfo.keyScanInfo.entities.concat(entities);
                keyInfo.keyScanInfo.hasMoreEntities = entities.length == keyInfo.keyScanInfo.pageSize;
                redisInstance.ioStreamer.next([{type: ioActions.SELECTED_NODE_UPDATED, keyInfo: keyInfo}])
            });
        } else {
            await redisutils.scanKeyEntities(redisInstance,
                keyInfo.key,
                keyInfo.type,
                keyInfo.keyScanInfo.cursor,
                data.pattern,
                keyInfo.keyScanInfo.pageSize,
                async (entities, cursor) => {
                    console.log(entities);
                    console.log(cursor);
                    // if search, start from zero
                    if (data.pattern || data.pattern == '') {
                        keyInfo.keyScanInfo.entities = entities;
                    } else {
                        keyInfo.keyScanInfo.entities = keyInfo.keyScanInfo.entities.concat(entities);
                    }                    
                    keyInfo.keyScanInfo.cursor = cursor;
                    keyInfo.keyScanInfo.hasMoreEntities = cursor != "0";
                    redisInstance.ioStreamer.next([{type: ioActions.SELECTED_NODE_UPDATED, keyInfo: keyInfo}]) 
                                        
            })
        }
        
    });
    /**
     * rescan from cursor 0 and count as previously loaded lenght
     */
    client.on(actions.REFRESH_LOADED_KEYS, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        redisInstance.keyInfo.cursor = "0";
        // In case of refresh (Maybe after user start monitoring)
        redisInstance.keyInfo.previousCursors = ["0"];  
        // iter from current cursor with pagesize
        redisutils.scanRedisTree(redisInstance,
            redisInstance.keyInfo.cursor,
            redisInstance.keyInfo.pattern,
            redisInstance.keyInfo.pageSize * redisInstance.keyInfo.pageSize,
            async (keys, cursor) => {
                redisInstance.keys = keys;
                redisInstance.keyInfo.cursor = cursor;
                redisInstance.keyInfo.pageIndex++;
                redisInstance.keyInfo.hasMoreKeys = cursor !== "0";
                
                redisInstance.ioStreamer.next([{type: ioActions.UPDATE_LOCAL_TREE}])  
        })
    });
    /**
     * User disconnects from redis instance
     * if no one uses disconencted redis instance, dispose it.
     */
    client.on(actions.DISCONNECT_REDIS_INSTANCE, async (redisId) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        redisInstance.connectedClientCount--;
        // if no connection left remove redis instance
        if(redisInstance.connectedClientCount < 1) {
            db.redisInstances = db.redisInstances.filter(p=>p.roomId != redisId);
        }
        client.emit(actions.DISCONNECT_REDIS_INSTANCE_SUCCESS,
            {redisId:redisId})
        client.leave(redisId);
    });
    /**
     * User leaves app,
     * If any unused redis instances, dispose them.
     */
    client.on('disconnect', async () => {
        const clientRooms = client.rooms;
        for (let i = 0; i < clientRooms.length; i++) {
            const room = clientRooms[i];
            connectedRedisInstance = db.redisInstances.find(p=>p.roomId==room);
            if(connectedRedisInstance) {
                connectedRedisInstance.connectedClientCount--;
                if(redisInstance.connectedClientCount < 1) {
                    connectedRedisInstance.redis.disconnect();
                    db.redisInstances = db.redisInstances.filter(p=>p.roomId == room);
                }
            }            
        } 
        console.log('Client disconnected')
    });

});
