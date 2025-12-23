require('dotenv').config();
const { pool } = require('./config');

async function setupNotifications() {
    console.log('Starting notifications database setup...');
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                type ENUM('like', 'comment', 'system', 'drill') NOT NULL,
                content TEXT NOT NULL,
                link VARCHAR(255),
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Notifications table created.');
    } catch (err) {
        console.error('Notifications setup failed:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

setupNotifications();
