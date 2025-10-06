const db = require('../config/database-sqlite');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(conditions = {}, orderBy = 'id ASC') {
    await db.connect();
    let query = `SELECT * FROM ${this.tableName}`;
    const values = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }
    
    query += ` ORDER BY ${orderBy}`;
    
    const result = await db.query(query, values);
    return result.rows;
  }

  async findById(id) {
    await db.connect();
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findOne(conditions) {
    await db.connect();
    const query = `SELECT * FROM ${this.tableName} WHERE ${Object.keys(conditions)
      .map((key, index) => `${key} = ?`)
      .join(' AND ')} LIMIT 1`;
    const values = Object.values(conditions);
    const result = await db.query(query, values);
    return result.rows[0] || null;
  }

  async create(data) {
    await db.connect();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
    `;
    
    const result = await db.run(query, values);
    const newRecord = await this.findById(result.lastID);
    return newRecord;
  }

  async update(id, data) {
    await db.connect();
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((key, index) => `${key} = ?`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = ?
    `;
    
    const result = await db.run(query, [...values, id]);
    if (result.changes > 0) {
      return await this.findById(id);
    }
    return null;
  }

  async delete(id) {
    await db.connect();
    const record = await this.findById(id);
    if (record) {
      const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
      await db.run(query, [id]);
    }
    return record;
  }

  async count(conditions = {}) {
    await db.connect();
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const values = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map((key, index) => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }
    
    const result = await db.query(query, values);
    return parseInt(result.rows[0].count);
  }
}

module.exports = BaseRepository;
