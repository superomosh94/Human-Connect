const { query } = require('../database/config');
const bcrypt = require('bcryptjs');

class User {
    static async create({ username, email, password }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        const result = await query(sql, [username, email, hashedPassword]);
        return result.insertId;
    }

    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const rows = await query(sql, [email]);
        return rows[0];
    }

    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        const rows = await query(sql, [id]);
        return rows[0];
    }

    static async verifyPassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }
}

module.exports = User;
