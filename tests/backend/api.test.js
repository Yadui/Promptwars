const request = require('supertest');
const express = require('express');
const { validateMetrics } = require('../../server/utils/validation');
const { mapDifficulty } = require('../../server/utils/difficulty');

// Setup a mock app similar to server/index.js (but without real Gemini)
const app = express();
app.use(express.json());

// Mock Gemini
const mockGenerateContent = jest.fn();
const mockModel = {
    generateContent: mockGenerateContent
};

// Route under test (simulating server/index.js logic)
app.post('/api/analyze', async (req, res) => {
    try {
        const { metrics } = req.body;
        const error = validateMetrics(metrics);
        if (error) return res.status(400).json({ error });

        const result = await mockModel.generateContent({ prompt: 'test' });
        const analysis = JSON.parse(result.response.text());

        if (!analysis.cognitive_profile || !analysis.difficulty_adjustment || !analysis.commentary) {
            return res.status(500).json({ error: "Incomplete AI response" });
        }

        analysis.difficulty_adjustment = mapDifficulty(analysis.difficulty_adjustment);
        res.json(analysis);
    } catch (e) {
        res.status(500).json({ error: "Analysis failed" });
    }
});

describe('POST /api/analyze', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('returns 200 for a valid request', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify({
                    cognitive_profile: "Flow State",
                    difficulty_adjustment: "increase",
                    commentary: "Good job"
                })
            }
        });

        const response = await request(app)
            .post('/api/analyze')
            .send({
                metrics: {
                    linesCleared: 5,
                    avgPlacementTime: 500,
                    maxStackHeight: 0,
                    rotationCount: 10,
                    panicPlacements: 0
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.cognitive_profile).toBe("Flow State");
    });

    test('returns 400 for invalid payload', async () => {
        const response = await request(app)
            .post('/api/analyze')
            .send({ metrics: { linesCleared: 'none' } });

        expect(response.status).toBe(400);
    });

    test('returns 500 for incomplete AI response', async () => {
        mockGenerateContent.mockResolvedValue({
            response: {
                text: () => JSON.stringify({
                    commentary: "Wait what"
                })
            }
        });

        const response = await request(app)
            .post('/api/analyze')
            .send({
                metrics: {
                    linesCleared: 5,
                    avgPlacementTime: 500,
                    maxStackHeight: 0,
                    rotationCount: 10,
                    panicPlacements: 0
                }
            });

        expect(response.status).toBe(500);
    });

    test('returns 500 on Gemini error', async () => {
        mockGenerateContent.mockRejectedValue(new Error("Gemini down"));

        const response = await request(app)
            .post('/api/analyze')
            .send({
                metrics: {
                    linesCleared: 5,
                    avgPlacementTime: 500,
                    maxStackHeight: 0,
                    rotationCount: 10,
                    panicPlacements: 0
                }
            });

        expect(response.status).toBe(500);
    });
});
