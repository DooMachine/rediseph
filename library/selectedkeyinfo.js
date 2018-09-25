


module.exports = class SelectedKeyInfo {
    constructor(key, type, redisId) {
        this.redisId = redisId;  
        this.key=key;
        this.type=type;
        this.value= '';
        this.isMonitoring= false;
        this.keyScanInfo= {
            entities: [],
            cursor: "0",
            hasMoreEntities: true,
            previousCursors: [],
            selectedEntityIndex: 0,
            pageIndex: 0,
            pageSize:process.env.SCAN_PAGE_SIZE || 20,
            pattern: '*'
        }        
    }
  }