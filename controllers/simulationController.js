const axios = require('axios');
const fs = require('fs');
const path = require('path');
const db = require('../database/config');
const challengeController = require('./challengeController');

// Load the SARA prompt
const saraPromptPath = path.join(__dirname, '../SARA_Prompt.md');
let systemPrompt = '';
try {
    systemPrompt = fs.readFileSync(saraPromptPath, 'utf8');
} catch (err) {
    console.error('Error reading SARA prompt:', err);
    systemPrompt = 'You are a helpful expert conversation coach.';
}



exports.getSimulationHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const history = await db.query(
            'SELECT role, content, feedback, options FROM simulation_messages WHERE user_id = ? ORDER BY created_at ASC',
            [userId]
        );
        res.json({ success: true, history });
    } catch (error) {
        console.error('Fetch History Error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

exports.resetSimulation = async (req, res) => {
    try {
        const userId = req.session.user.id;
        await db.query('DELETE FROM simulation_messages WHERE user_id = ?', [userId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Reset Sim Error:', error);
        res.status(500).json({ error: 'Failed to reset simulation' });
    }
};

exports.getSimulationResponse = async (req, res) => {
    try {
        const { message, context, mode } = req.body;
        const userId = req.session.user.id;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'AI Service Misconfigured (Missing API Key)' });
        }

        // 1. Save User Message
        await db.query(
            'INSERT INTO simulation_messages (user_id, role, content) VALUES (?, ?, ?)',
            [userId, 'user', message]
        );

        // 2. Get history for context (last 10 messages)
        const historyRows = await db.query(
            'SELECT role, content FROM simulation_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [userId]
        );
        const history = historyRows.reverse();

        // 3. Prepare AI Prompt
        const messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'system', content: `Current Simulation Context: ${context}. User is practicing in '${mode}' mode. 
      IMPORTANT: You MUST return a valid JSON object. Do not include any text outside the JSON.
      Structure:
      {
        "response": "The character's actual conversational response",
        "feedback": "A short piece of coach feedback (max 1 sentence)",
        "score": number (1-4), // Rate the user's response: 1=Interrogation, 2=Discovery, 3=Shared Reality, 4=Exceptional Shared Reality
        "options": [
          "Option 1 (Poor)",
          "Option 2 (Better)",
          "Option 3 (Best/Shared Reality)"
        ]
      }` },
        ];

        history.forEach(row => {
            messages.push({ role: row.role, content: row.content });
        });

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: 'llama-3.1-8b-instant',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        const aiContent = response.data.choices[0].message.content;
        let aiData;
        try {
            aiData = JSON.parse(aiContent);
        } catch (e) {
            console.error('AI JSON Parsing Error. Raw Content:', aiContent);
            aiData = {
                response: aiContent,
                feedback: "SARA is struggling to format feedback right now.",
                score: 1,
                options: ["Let's try that again", "Can you rephrase?", "Wait, what?"]
            };
        }

        // 4. Save AI Response and Score
        await db.query(
            'INSERT INTO simulation_messages (user_id, role, content, feedback, options, score) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'ai', aiData.response, aiData.feedback, JSON.stringify(aiData.options), aiData.score || 1]
        );

        // Update challenge progress
        await challengeController.updateChallengeProgress(userId, 'simulation');

        res.json({ success: true, ...aiData });

    } catch (error) {
        if (error.response) {
            console.error('Groq API Error Detail:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('AI API Error:', error.message);
        }
        res.status(500).json({ error: 'Failed to get AI response' });
    }
};
