const sqlite3 = require('better-sqlite3');
const db = new sqlite3('backend/database.sqlite');
console.log(db.prepare("SELECT id, name, status, key FROM admin_providers").all());
