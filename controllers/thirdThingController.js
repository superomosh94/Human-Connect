const axios = require('axios');
const db = require('../database/config');

exports.generateStarters = async (req, res) => {
    try {
        const { context } = req.body;
        if (!context) return res.status(400).json({ error: 'Context is required' });

        const prompt = `You are an expert in "Shared Reality" social skills. 
        Your task is to generate 3 creative conversation starters based on the "Third Thing" principle.
        The "Third Thing" is an observation of something in the environment that both people can see, which serves as a low-pressure bridge to connection.
        
        Context: ${context}
        
        Provide the response in JSON format:
        {
            "starters": [
                { "text": "Starter text here", "why": "Why this works based on Shared Reality principles" },
                ...
            ]
        }`;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = JSON.parse(response.data.choices[0].message.content);
        res.json({ success: true, starters: data.starters });
    } catch (error) {
        console.error('Third Thing Error:', error);
        res.status(500).json({ error: 'Failed to generate starters' });
    }
};
