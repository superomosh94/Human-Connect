const { pool } = require('./config');

async function migrate() {
    try {
        console.log('Adding score column to simulation_messages...');
        await pool.query('ALTER TABLE simulation_messages ADD COLUMN score INT DEFAULT NULL AFTER options');
        console.log('Success!');
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists.');
        } else {
            console.error('Migration error:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
