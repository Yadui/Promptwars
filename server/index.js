require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
app.use(helmet());
app.use(compression());
app.disable('x-powered-by');
const port = process.env.PORT || 3000;

// Security Middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 requests per windowMs
    message: { error: "Too many requests, please slow down." }
});

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use('/api/analyze', limiter);

// Utilities
const { validateMetrics } = require('./utils/validation');
const { mapDifficulty } = require('./utils/difficulty');

// Firestore Setup - Only initialize if credentials/project are set to avoid local metadata lookup warnings
const { Firestore, FieldValue } = require('@google-cloud/firestore');
let db;
if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE) {
    try {
        db = new Firestore();
        console.log("Firestore initialized successfully");
    } catch (e) {
        console.error("Firestore initialization failed:", e.message);
    }
} else {
    console.log("Firestore skipped: Running locally without GCP context. Logs will be file-based only.");
}

// Env Check
if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: Missing GEMINI_API_KEY in environment variables");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const fs = require('fs');
const path = require('path');

app.post('/api/analyze', async (req, res) => {
    try {
        const { metrics, gameId } = req.body;

        const validationError = validateMetrics(metrics);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const prompt = `
Analyze this Tetris player's performance.

Metrics:
${JSON.stringify(metrics)}

Return JSON with:
- cognitive_profile (Flow State, Panicked, Bored, Strategic, Chaotic)
- difficulty_adjustment (increase, decrease, maintain, spike)
- commentary (max 120 chars)
`;

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const analysis = JSON.parse(result.response.text());

        if (!analysis.cognitive_profile || !analysis.difficulty_adjustment || !analysis.commentary) {
            return res.status(500).json({ error: "Incomplete AI response" });
        }

        analysis.difficulty_adjustment = mapDifficulty(analysis.difficulty_adjustment);

        // Firestore Logging (Non-blocking)
        if (db) {
            db.collection('game_logs').add({
                gameId: gameId || 'anonymous',
                timestamp: FieldValue.serverTimestamp(),
                metrics,
                analysis
            }).catch(err => console.error("Firestore error:", err));
        }

        // File Logging (Legacy)
        if (gameId) {
            const logDir = path.join(__dirname, 'logs');
            const logFile = path.join(logDir, `game_${gameId}.jsonl`);
            const logEntry = JSON.stringify({ timestamp: new Date().toISOString(), metrics, analysis }) + '\n';
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
            fs.appendFile(logFile, logEntry, (err) => {
                if (err) console.error("Error writing to log file:", err);
            });
        }

        res.json(analysis);

    } catch (error) {
        console.error("Gemini error:", error);
        res.status(500).json({ error: "Analysis failed" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
