const express = require('express');
const socketio = require('socket.io');
const _ = require('lodash');
const uuid = require('uuid');
const Redis = require('ioredis');
const redisutils = require('./library/redisutils')
const actions = require('./library/actions');


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

    client.on(actions.CONNECT_REDIS_INSTANCE, (data) => {
        console.log(data);

        let roomId = data.ip + '|' + data.port + '|' + data.db + '|' + data.password;
        data.id = roomId;
        const cachedRedis = db.redisInstances.find(p=>p.roomId == roomId);
        if(cachedRedis) {
            client.join(roomId);
            client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                {redisInfo: data, redisTree: cachedRedis.redisTree, serverInfo: cachedRedis.redis.serverInfo})
        } else {
            const redis = new Redis({
                host: data.ip, port: data.port, db: data.db,
                password: data.password,
            });
            
            redis.on('error', (e) => {           
                db.redisInstances = db.redisInstances.filter(p=>p.roomId != roomId)
                client.emit(actions.CONNECT_REDIS_INSTANCE_FAIL,
                    {redisInfo: data, redisTree: tree, serverInfo: redis.serverInfo, error: e.message})
            });
          
            redis.on('ready', () => {
                console.log("Redis Ready")
                redisutils.buildRedisTree(redis).then((tree) => {
                    const redisInstance = {roomId:roomId, redis: redis, redisTree: tree};
                    db.redisInstances.push(redisInstance)              
                    client.join(roomId)
                    console.log(redisInstance);
                    client.emit(actions.CONNECT_REDIS_INSTANCE_SUCCESS,
                        {redisInfo: data, redisTree: tree, serverInfo: redis.serverInfo})
                })
                .catch((err)=> console.log(err))
            });
        }        
    });

    client.on(actions.EXECUTE_COMMAND, (command) => {
        io.in('notes').emit(actions.NOTE_ADDED, newNote);
    });

    client.on('disconnect', () => {
      console.log('Client disconnected')
    });

});
