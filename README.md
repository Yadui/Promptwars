# Tetris Adaptive Intelligence (AI) Mode

![CI](https://github.com/Yadui/Promptwars/actions/workflows/ci.yml/badge.svg)

**Vertical**: AI-Adaptive Gaming & Neuro-Feedback Systems

## 🚀 Overview
Tetris AI is a reimagined version of the classic puzzle game that dynamically adapts its difficulty using **Google Gemini 2.0 Flash**. By analyzing player "Flow State" in real-time, the game ensures an optimally challenging experience—never too easy to be boring, never too hard to be frustrating.

---

## 🧠 Architectural Decisions
- **Asynchronous AI Loop**: The AI analysis runs in a non-blocking background loop (every 30s) to ensure zero impact on 60FPS gameplay.
- **Decoupled Rendering**: The Active Piece is separated from the Static Grid state. Visual composition happens during the render pass, eliminating state-driven "Logic Loops" that cause lag in traditional React engines.
- **Stateless Core Logic**: Game logic is implemented as pure, stateless functions for maximum computational efficiency and testability.
- **Defensive Parsing**: Robust frontend error handling prevents malformed AI responses from impacting game stability.

---

## 🔐 Security Architecture
- **Header Hardening**: Implemented `helmet` middleware to set secure HTTP headers and disable `x-powered-by`.
- **Rate Limiting**: Backend protected by `express-rate-limit` (30 requests/min per IP) to prevent API abuse.
- **Strict Validation**: All incoming telemetry metrics undergo strict schema validation before AI processing.
- **Secret Management**: Fail-fast enforcement for missing API keys; sensitive credentials never exported to the client or committed to Git.

---

## ⚡ Performance & Efficiency
- **Middleware Optimization**: Gzip/Brotli compression enabled via `compression()` middleware.
- **Non-Blocking Telemetry**: Firestore writes are handled asynchronously; gameplay never waits for logging confirmation.
- **Adaptive Polling**: Intelligent 30s interval balances real-time feedback with API quota conservation.
- **Low-Latency Composition**: Zero-lag visual composition of the active tetromino on the game board.

---

## 🧪 Testing & Quality
- **Automated CI**: GitHub Actions pipeline runs on every push to ensure code integrity.
- **Logic Coverage**: 100% statement coverage for the core Tetris engine using Jest (ESM mode).
- **Test Suites**: 25+ automated tests covering collision detection, row clearing, and AI mapping logic.
- **Static Analysis**: Clean linting state across both frontend and backend modules.

---

## ☁️ Google Services Used
- **Google Gemini API**: Powers the core adaptive difficulty engine and personality-driven commentary.
- **Google Cloud Firestore**: Strategic telemetry logging for anonymous performance analytics.
- **Google Cloud Run**: Containerized serverless orchestration for scalable delivery.
- **Google Cloud Build**: Integrated CI/CD pipeline for automated multi-service deployment.

---

## ⚙️ How to Run Locally

### 1. Prerequisites
- Node.js (v18+)
- Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

### 2. Backend Setup
```bash
cd server
npm install
# Add GEMINI_API_KEY to .env
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
# Update VITE_API_URL in .env if needed
npm run dev
```

### 4. Running Tests
```bash
npm test
```

---

## ♿ Accessibility
- **ARIA Implementation**: Full semantic grid structure with `role="grid"` and `role="gridcell"`.
- **Screen Reader Support**: Dynamic `aria-label` tags describe board state and piece types.
- **High Contrast**: Optimized neon-on-dark palette for maximum visual clarity.
