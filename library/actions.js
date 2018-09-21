module.exports = {
    CONNECT_REDIS_INSTANCE: '[Redis] CONNECT_REDIS_INSTANCE',
    CONNECT_REDIS_INSTANCE_SUCCESS: '[Redis] CONNECT_REDIS_INSTANCE_SUCCESS',
    CONNECT_REDIS_INSTANCE_FAIL : '[Redis] CONNECT_REDIS_INSTANCE_FAIL',
    
    WATCH_CHANGES: '[Redis] WATCH_CHANGES',
    WATCHING_CHANGES: '[Redis] WATCHING_CHANGES',
    STOP_WATCH_CHANGES: '[Redis] STOP_WATCH_CHANGES',
    STOPPED_WATCH_CHANGES: '[Redis] STOPPED_WATCH_CHANGES',

    ITER_NEXT_PAGE_SCAN: '[Redis] ITER_NEXT_PAGE_SCAN',
    /**
     * Scan from cursor 0 with count as pageIndex* pageSize
     */
    REFRESH_LOADED_KEYS: '[Redis] REFRESH_LOADED_KEYS',

    SET_SEARCH_QUERY: '[Redis] SET_SEARCH_QUERY',
    SET_SELECTED_NODE: '[Redis] SET_SELECTED_NODE',
    SELECTED_NODE_UPDATED: '[Redis] SELECTED_NODE_UPDATED',
    DISCONNECT_REDIS_INSTANCE: '[Redis] DISCONNECT_REDIS_INSTANCE', 
    DISCONNECT_REDIS_INSTANCE_SUCCESS: '[Redis] DISCONNECT_REDIS_INSTANCE_SUCCESS', 
    REDIS_CONNECTION_LOST : '[Redis] REDIS_CONNECTION_LOST',
    REDIS_INSTANCE_UPDATED: '[Redis] REDIS_INSTANCE_UPDATED',
    EXECUTE_COMMAND: '[Redis] EXECUTE_COMMAND'
  };