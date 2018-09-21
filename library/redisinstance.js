

const Subject = require('rxjs').Subject;

module.exports = class RedisInstance {
    constructor(roomId,connectionInfo,redis) {
        this.roomId = roomId,
        this.connectionInfo= connectionInfo,
        this.redis= redis,
        this.cmdStreamer= new Subject(),
        this.ioStreamer= new Subject(),
        this.keys= {},
        this.isMonitoring=false,
        this.keyInfo= {
            selectedKey: null,  
            pattern: '',
            hasMoreKeys: true,
            cursor: "0",
            previousCursors: [],
            pageIndex:0,
            pageSize: process.env.SCAN_PAGE_SIZE || 8,
        }
    }
  }