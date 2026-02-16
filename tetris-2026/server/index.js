require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10kb' }));

if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const fs = require('fs');
const path = require('path');

app.post('/api/analyze', async (req, res) => {
    try {
        const { metrics, gameId } = req.body;

        if (!metrics || typeof metrics !== 'object') {
            return res.status(400).json({ error: "Invalid metrics payload" });
        }

        const prompt = `
Analyze this Tetris player's performance over the last 60 seconds.

Metrics:
${JSON.stringify(metrics)}

Return JSON with:
- cognitive_profile (Flow State, Panicked, Bored, Strategic, Chaotic)
- difficulty_adjustment (increase, decrease, maintain, spike)
- commentary (max 120 chars)
`;

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        });

        const text = result.response.text();
        const analysis = JSON.parse(text);

        if (!analysis.cognitive_profile ||
            !analysis.difficulty_adjustment ||
            !analysis.commentary) {
            return res.status(500).json({ error: "Incomplete AI response" });
        }

        // Log to file if gameId is present
        if (gameId) {
            const logDir = path.join(__dirname, 'logs');
            const logFile = path.join(logDir, `game_${gameId}.jsonl`);

            const logEntry = JSON.stringify({
                timestamp: new Date().toISOString(),
                metrics,
                analysis
            }) + '\n';

            fs.appendFile(logFile, logEntry, (err) => {
                if (err) console.error("Error writing to log file:", err);
            });
        }

        res.json(analysis);

    } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
