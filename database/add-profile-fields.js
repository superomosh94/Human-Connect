require('dotenv').config();
const { pool } = require('./config');

async function migrate() {
    console.log('Starting migration to add profile fields...');
    const connection = await pool.getConnection();
    try {
        const columns = [
            'ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT "/img/default-avatar.png"',
            'ALTER TABLE users ADD COLUMN bio TEXT',
            'ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE'
        ];

        for (const sql of columns) {
            try {
                await connection.query(sql);
                console.log(`Executed: ${sql}`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME') {
                    console.log(`Column already exists, skipping.`);
                } else {
                    throw err;
                }
            }
        }
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

migrate();
