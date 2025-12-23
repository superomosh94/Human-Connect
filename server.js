require('dotenv').config();
const app = require('./app');
const { pool } = require('./database/config');

const PORT = process.env.PORT || 3000;

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        // process.exit(1); // Optional: keep running even if DB fails initially
    });

app.listen(PORT, () => {
    console.log(`Shared Reality app running on http://localhost:${PORT}`);
});
