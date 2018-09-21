

const Rx = require('rxjs');
const ioActions = require('./actions');

module.exports = class RedisInstance {
    constructor(roomId,connectionInfo,redis) {
        this.roomId = roomId,
        this.connectionInfo= connectionInfo,
        this.redis= redis,
        this.cmdStreamer= new Rx.Subject(),
        this.ioStreamer= new Rx.Subject(),
        this.keys= {},
        this.isMonitoring=false,
        this.keyInfo= {
            selectedKey: null,
            pattern: '',
            hasMoreKeys: true,
            cursor: 0,
            previousCursor: 0,
            pageSize: 40,
        }
    }
  }