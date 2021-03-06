

const Subject = require('rxjs').Subject;

module.exports = class RedisInstance {
    constructor(roomId,connectionInfo,redis) {
        this.roomId = roomId,
        this.connectionInfo= connectionInfo,
        this.redis= redis,
        this.terminalInfo = {
            lines: ['Connecting to '+ this.connectionInfo.ip],            
        },
        this.cmdStreamer= new Subject(),
        this.ioStreamer= new Subject(),
        this.monitorDebouncer = new Subject(),
        this.keys= new Map(),
        this.connectedClientCount = 1;
        this.isMonitoring=false,
        // hscan, zscan etc.
        this.selectedKeyInfo = []; 
        this.keyInfo= {
            pattern: '',
            hasMoreKeys: true,
            cursor: "0",
            previousCursors: [],
            pageIndex:0,
            pageSize: process.env.SCAN_PAGE_SIZE || 100,
        }        
    }
  }