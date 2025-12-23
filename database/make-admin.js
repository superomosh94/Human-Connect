require('dotenv').config();
const { pool } = require('./database/config');

async function makeAdmin(email) {
    if (!email) {
        console.error('Please provide an email.');
        process.exit(1);
    }

    console.log(`Promoting ${email} to admin...`);
    const connection = await pool.getConnection();
    try {
        const result = await connection.query('UPDATE users SET is_admin = TRUE WHERE email = ?', [email]);
        if (result[0].affectedRows > 0) {
            console.log('Success! User is now an admin.');
        } else {
            console.log('User not found.');
        }
    } catch (err) {
        console.error('Failed to promote user:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

makeAdmin(process.argv[2]);
