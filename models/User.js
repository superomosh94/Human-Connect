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
        const sql = 'SELECT id, username, email, level, xp_points, streak_days, avatar_url, bio, is_admin FROM users WHERE id = ?';
        const rows = await query(sql, [id]);
        return rows[0];
    }

    static async verifyPassword(inputPassword, storedHash) {
        return await bcrypt.compare(inputPassword, storedHash);
    }

    static async updateProfile(id, { username, bio, avatar_url }) {
        let sql = 'UPDATE users SET username = ?, bio = ?';
        const params = [username, bio];

        if (avatar_url) {
            sql += ', avatar_url = ?';
            params.push(avatar_url);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        return await query(sql, params);
    }

    static async updatePassword(id, password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
        return await query(sql, [hashedPassword, id]);
    }
}

module.exports = User;
