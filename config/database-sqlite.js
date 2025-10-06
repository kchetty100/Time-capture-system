const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

class SQLiteDatabaseConfig {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'reverside_time_tracker.db');
  }

  connect() {
    if (!this.db) {
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening SQLite database:', err.message);
        } else {
          console.log('Connected to SQLite database');
        }
      });
    }
    return this.db;
  }

  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: rows || [] });
        }
      });
    });
  }

  async queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows: row ? [row] : [] });
        }
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            lastID: this.lastID, 
            changes: this.changes,
            rows: []
          });
        }
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      });
    }
  }
}

module.exports = new SQLiteDatabaseConfig();
