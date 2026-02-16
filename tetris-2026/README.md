# Tetris 2026 – Adaptive Intelligence Mode

A modern Tetris implementation with an AI-driven adaptive difficulty system.

## Features
- **AI Commentary**: Real-time feedback on your playstyle.
- **Adaptive Difficulty**: Gravity adjusts based on your performance metrics.
- **Next Block Preview**: Plan ahead with the upcoming piece.
- **Modern UI**: Glowing dark theme with glassmorphism.

## Testing

The project uses Jest for both backend and frontend testing with coverage reporting.

### Running Tests
To run all tests:
```bash
npm test
```

To run with coverage:
```bash
npm test -- --coverage
```

### Structure
- `tests/backend/`: Tests for API endpoints, validation, and difficulty logic.
- `tests/frontend/`: Tests for core game logic, collision detection, and metrics.

### Coverage Target
- **Statement Coverage**: 70%+
- **Branch Coverage**: 60%+

## Deployment
Deployed on Google Cloud Run.
- **Client**: https://tetris-client-1048980752257.us-central1.run.app
- **Server**: https://tetris-server-1048980752257.us-central1.run.app
