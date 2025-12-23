require('dotenv').config();
const { pool } = require('./config');

async function setupSocial() {
    console.log('Starting social database setup...');
    const connection = await pool.getConnection();
    try {
        // Likes table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS likes (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                world_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (world_id) REFERENCES shared_worlds(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_like (user_id, world_id)
            )
        `);
        console.log('Likes table created.');

        // Comments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                world_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (world_id) REFERENCES shared_worlds(id) ON DELETE CASCADE
            )
        `);
        console.log('Comments table created.');

        console.log('Social database setup completed successfully.');
    } catch (err) {
        console.error('Social setup failed:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

setupSocial();
