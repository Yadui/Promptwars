# Tetris Adaptive Intelligence (AI) Mode

**Vertical**: AI-Adaptive Gaming & Neuro-Feedback Systems

## 🚀 Overview
Tetris AI is a reimagined version of the classic puzzle game that dynamically adapts its difficulty using Google Gemini AI. By monitoring real-time player performance metrics, the game adjusts its mechanics to keep the user in a "Flow State," preventing boredom from low difficulty or frustration from high difficulty spikes.

### 🔗 Deployment
- **Frontend (Client)**: [Deployed URL](https://tetris-client-1048980752257.us-central1.run.app)
- **Backend (Server)**: [Deployed URL](https://tetris-server-1048980752257.us-central1.run.app)

---

## 🧠 Approach & Logic

### 1. The Metric Feedback Loop
The game tracks three critical performance dimensions:
- **Decision Speed**: Time taken from piece spawn to placement.
- **Finesse/Panic**: Rapid, jittery movements detected as "Panic Moves" (under 300ms per placement).
- **Structural Strategy**: Unevenness of the stack and maximum stack height.

### 2. AI Cognitive Profiling
Every 15 seconds, the accumulated metrics are sent to **Google Gemini 2.0 Flash**. The AI performs a non-blocking analysis to determine:
- **Current State**: Is the player bored, focused, or overwhelmed?
- **Mechanical Adjustment**: Should gravity increase (Pressure Spike), decrease (Adrenaline Recovery), or stay stable?
- **Commentary**: Provides lore-driven, atmospheric feedback on the player's performance.

### 3. Decoupled Rendering Architecture
To ensure zero-latency gameplay at 60FPS:
- The **Active Piece** is decoupled from the **Static Grid** state.
- Visual composition happens during the render pass, eliminating state-driven "Logic Loops" that traditionally cause freezes in React-based Tetris engines.

---

## 🛡️ Security & Responsibility
- **Rate Limiting**: Backend protected by `express-rate-limit` (30 requests/min).
- **Payload Validation**: Strict schema validation ensures only legitimate metrics are processed by the AI.
- **Environment Safety**: Sensitive Gemini API keys are never exposed; they are handled via server-side environment variables in Cloud Run.

---

## 🧪 Testing & Quality
- **Unit Testing**: 100% logic coverage using Jest (ESM mode).
- **Automation**: Test suites cover collision detection, row clearing, and AI mapping logic.
- **Verification**: `tests/frontend/gameLogic.test.mjs` verifies core engine integrity.

---

## ♿ Accessibility
- **ARIA Implementation**: The board uses `role="grid"` and cells use `role="gridcell"` with dynamic `aria-label` tags for screen-reader compatibility.
- **High Contrast**: Neon-on-dark color palette optimized for visibility and reduced eye strain.

---

## ☁️ Google Services Used
- **Gemini API**: Core engine for cognitive profiling and adaptive difficulty.
- **Firestore**: Anonymous gameplay analytics and performance logging.
- **Google Cloud Run**: Serverless orchestration for scalable deployment.
- **Google Cloud Build**: Integrated CI/CD pipeline for automated delivery.

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js 20+
- Google Gemini API Key

### Backend
```bash
cd server
npm install
# Create .env with GEMINI_API_KEY
node index.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Run Tests
```bash
npm test
```

---

## 📝 Assumptions
1. **API Availability**: Assumes stable connection to Google Generative AI services.
2. **Browser Specs**: Optimized for modern evergreen browsers with hardware acceleration for CSS Grid rendering.
