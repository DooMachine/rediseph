

const Subject = require('rxjs').Subject;
const SelectedKeyInfo = require('./selectedkeyinfo');

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
        // hscan, zscan etc.
        this.selectedKeyInfo = new SelectedKeyInfo(null,null)
        this.keyInfo= {
            pattern: '',
            hasMoreKeys: true,
            cursor: "0",
            previousCursors: [],
            pageIndex:0,
            pageSize: process.env.SCAN_PAGE_SIZE || 8,
        }        
    }
  }