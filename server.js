const express = require('express');
const socketio = require('socket.io');
const _ = require('lodash');
const uuid = require('uuid');
const Redis = require('ioredis');
const redisutils = require('./library/redisutils')
const actions = require('./library/actions');
const monitoractions = require('./library/monitoractions');


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

    console.log("client connected...");

    client.on(actions.CONNECT_REDIS_INSTANCE, (connectionInfo) => {

        let roomId = uuid();
        connectionInfo.id = roomId;
        const cachedRedis = db.redisInstances.find(p=>p.roomId == roomId);
        if(cachedRedis) {
            client.join(roomId);
            client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                {redisInfo: connectionInfo, redisTree: cachedRedis.redisScanTree, serverInfo: cachedRedis.redis.serverInfo})
        } else {
            const redis = new Redis({
                host: connectionInfo.ip, port: connectionInfo.port, db: connectionInfo.db,
                password: connectionInfo.password,
                retryStrategy: (times) => {
                    var delay = Math.min(times * 50, 3000);
                    return delay;
                }
            });
            
            redis.on('error', (e) => {           
                db.redisInstances = db.redisInstances.filter(p=>p.roomId != roomId)
                client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                    {redisInfo: connectionInfo, error: e.message})
                redis.disconnect();
            });
          
            redis.on('ready', async () => {
                const redisInstance = {
                    roomId:roomId,
                    connectionInfo: connectionInfo,
                    redis: redis,
                    keys: {},
                    keyInfo: {
                        selectedKey: null,
                        pattern: '',
                        hasMoreKeys: true,
                        pageIndex: 0,
                        pageSize: 50
                    }                    
                };
                // first scan when connected
                redisutils.scanRedisTree(redisInstance,
                    redisInstance.keyInfo.pageSize * redisInstance.keyInfo.pageIndex,
                    redisInstance.keyInfo.pattern,
                    redisInstance.keyInfo.pageSize,
                    (keys) => {
                        redisInstance.keys = keys;
                        redisInstance.keyInfo.pageIndex++;
                        if (redisInstance.keyInfo.pageSize != keys.length)
                        {
                            redisInstance.keyInfo.hasMoreKeys = false;
                        }
                        db.redisInstances.push(redisInstance)              
                        client.join(roomId)
                        client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                            {redisInfo: connectionInfo, keyInfo:redisInstance.keyInfo, keys: keys, serverInfo: redis.serverInfo})
                })
            });

            client.on(actions.WATCH_CHANGES, async (data) => {
                const redisInstance = db.redisInstances.find(p=>p.roomId == data)
                redisInstance.redis.monitor(async (err, monitor) => {
                    let prevTime = 0;
                    monitor.on('monitor', async (time, args, source, database) => {
                        prevTime = time;
                        redisutils.handleMonitorCommand(redisInstance,args, (acts) => {
                            if(acts.some(p=>p.type ==  monitoractions.UPDATE_LOCAL_TREE)) {
                                io.to(roomId).emit(actions.REDIS_INSTANCE_UPDATED,
                                    {redisInfo: redisInstance.connectionInfo,keyInfo:redisInstance.keyInfo, keys: redisInstance.keys, serverInfo: redis.serverInfo})
                            } 
                            if(acts.some(p=>p.type ==  monitoractions.REMOVE_LOCAL_TREE)) {
                                io.to(roomId).emit(actions.REDIS_INSTANCE_UPDATED,
                                    {redisInfo: redisInstance.connectionInfo,keyInfo:redisInstance.keyInfo,keys: redisInstance.keys, serverInfo: redis.serverInfo})
                            } 
                        });
                    });
                });
            })
            
            
        }        
    });

    client.on(actions.EXECUTE_COMMAND, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        await redisInstance.redis.call(data.args[0], data.args.slice(1));
    });
    client.on(actions.SET_SEARCH_QUERY, async (data) => {
        console.log("dototo")
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redis.id);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        redisInstance.keyInfo = {
            selectedKey: null,
            pattern: data.pattern,
            hasMoreKeys: true,
            pageIndex: 0,
            pageSize: 50
        };
        // first scan when connected
        redisutils.scanRedisTree(redisInstance,
            redisInstance.keyInfo.pageSize * redisInstance.keyInfo.pageIndex,
            redisInstance.keyInfo.pattern,
            redisInstance.keyInfo.pageSize,
            (keys) => {
                redisInstance.keys = keys;
                redisInstance.keyInfo.pageIndex++;
                if (redisInstance.keyInfo.pageSize != keys.length)
                {
                    redisInstance.keyInfo.hasMoreKeys = false;
                }
                client.emit(actions.REDIS_INSTANCE_UPDATED,
                    {redisInfo: redisInstance.connectionInfo, keyInfo:redisInstance.keyInfo, keys: keys, serverInfo: redisInstance.redis.serverInfo})
        })
    });

    client.on(actions.DISCONNECT_REDIS_INSTANCE, async (data) => {
        const redisInstance = db.redisInstances.find(p=>p.roomId == data.redisId);
        if (!redisInstance) {
            client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                {error: 'This should not happen!'})
        }
        client.leave(redisInstance.id);
        db.redisInstances = db.redisInstances.filter(p=> p.roomId != data.redisId);
    });

    client.on('disconnect', () => {
      console.log('Client disconnected')
      db.redisInstances = [];
    });

});
