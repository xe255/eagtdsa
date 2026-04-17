/**
 * Load persisted DB from Upstash (if configured) before requiring app.js.
 * Required when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
 */
require('dotenv').config();

(async () => {
    try {
        const db = require('./database');
        await db.ready();
        require('./app.js');
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
