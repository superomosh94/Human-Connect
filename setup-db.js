require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setup() {
    console.log('Starting database setup...');

    try {
        // Connect without database selected to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema...');
        await connection.query(schemaSql);

        console.log('Database and tables created successfully.');
        await connection.end();
    } catch (err) {
        console.error('Error executing schema:', err);
        process.exit(1);
    }
}

setup();
