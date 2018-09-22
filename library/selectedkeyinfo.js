


module.exports = class SelectedKeyInfo {
    constructor(key, type) {  
        this.key=key;
        this.type=type;
        this.value= '';
        this.keyScanInfo= {
            entities: [],
            cursor: "0",
            hasMoreEntities: true,
            previousCursors: [],
            pageIndex: 0,
            pageSize:process.env.SCAN_PAGE_SIZE || 20,
            pattern: '*'
        }        
    }
  }