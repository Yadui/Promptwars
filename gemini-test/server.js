const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
});

app.post("/analyze", async (req, res) => {
    try {
        const { metrics } = req.body;

        const prompt = `
Analyze Tetris gameplay metrics.

Return JSON with:
- cognitiveProfile
- difficultyAdjustment
- commentary (under 120 chars)

Metrics:
${JSON.stringify(metrics)}
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
        const parsed = JSON.parse(text);

        res.json(parsed);

    } catch (error) {
        console.error("FULL ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/test", async (req, res) => {
    try {
        const result = await model.generateContent("Say hello.");
        res.json({ text: result.response.text() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.get("/models", async (req, res) => {
    try {
        const models = await genAI.listModels();
        res.json(models);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(3001, () => {
    console.log("Server running on port 3001");
});
