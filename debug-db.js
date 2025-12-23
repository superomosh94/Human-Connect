const { pool } = require('./database/config');

async function debug() {
    try {
        const [rows] = await pool.query('DESCRIBE simulation_messages');
        console.log('Columns in simulation_messages:', rows.map(r => r.Field));

        const [challenges] = await pool.query('SHOW TABLES LIKE "challenges"');
        console.log('Challenges table exists:', challenges.length > 0);

        const [userChallenges] = await pool.query('SHOW TABLES LIKE "user_challenges"');
        console.log('User Challenges table exists:', userChallenges.length > 0);

        const [checkScore] = await pool.query('DESCRIBE simulation_messages');
        const hasScore = checkScore.some(c => c.Field === 'score');
        console.log('Has score column:', hasScore);

    } catch (err) {
        console.error('Debug error:', err);
    } finally {
        process.exit();
    }
}

debug();
