const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/verplex.db');

db.run(`CREATE TABLE IF NOT EXISTS actions (id INTEGER PRIMARY KEY, action TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`);

const logAction = (action) => {
    db.run(`INSERT INTO actions (action) VALUES (?)`, [action], function (err) {
        if (err) console.error('Error logging action:', err);
    });
};

module.exports = { logAction };
