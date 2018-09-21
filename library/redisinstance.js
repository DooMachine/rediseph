

const Subject = require('rxjs').Subject;

module.exports = class RedisInstance {
    constructor(roomId,connectionInfo,redis) {
        this.roomId = roomId,
        this.connectionInfo= connectionInfo,
        this.redis= redis,
        this.cmdStreamer= new Subject(),
        this.ioStreamer= new Subject(),
        this.keys= {},
        this.connectedClientCount = 1;
        this.isMonitoring=false,
        this.keyInfo= {
            pattern: '',
            hasMoreKeys: true,
            cursor: "0",
            previousCursors: [],
            pageIndex:0,
            pageSize: process.env.SCAN_PAGE_SIZE || 8,
        },
        // hscan, zscan etc.
        this.selectedKeyInfo = {
            key:null,
            type:null,
            value: null,
            keyScanInfo: {
                entities: [],
                cursor: "0",
                hasMoreEntities: true,
                previousCursors: [],
                pageIndex: 0,
                pageSize:process.env.SCAN_PAGE_SIZE || 20,
                pattern: ''
            }
        }
    }
  }