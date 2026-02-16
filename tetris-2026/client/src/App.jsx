import React, { useRef, useState, useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import Board from './components/Board';
import Display from './components/Display';
import StartButton from './components/StartButton';
import EndScreen from './components/EndScreen';
import CommentaryCard from './components/CommentaryCard';

const App = () => {
  // Destructure liveAnalysis from the hook
  const { grid, startGame, gameOver, score, rowsCleared, level, move, keyUp, player, metrics, liveAnalysis } = useTetris();
  const gameArea = useRef(null);
  const [analysis, setAnalysis] = useState(null); // Keep this for final game over analysis

  const handleFocus = () => {
    if (gameArea.current) gameArea.current.focus();
  };

  useEffect(() => {
    if (gameOver && metrics.placements.length > 0) {
      // Fetch final analysis
      const avgPlacementTime = metrics.placements.reduce((acc, p) => acc + p.timeTaken, 0) / metrics.placements.length || 0;
      const panicCount = metrics.placements.filter(p => p.isPanic).length;

      const payload = {
        linesCleared: metrics.linesCleared,
        avgPlacementTime,
        rotationCount: metrics.rotationCount,
        maxStackHeight: metrics.maxStackHeight,
        panicPlacements: panicCount,
        boardUnevenness: metrics.unevenness,
        isFinal: true
      };

      fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(data => setAnalysis(data))
        .catch(err => console.error("Error getting final analysis", err));
    } else if (!gameOver) {
      setAnalysis(null);
    }
  }, [gameOver, metrics]);

  return (
    <div
      className="App"
      role="button"
      tabIndex="0"
      onKeyDown={e => move(e)}
      onKeyUp={e => keyUp(e)}
      ref={gameArea}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-color)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center', // Center vertically
        justifyContent: 'center', // Center horizontally
        position: 'relative',
        color: 'white'
      }}
    >
      {gameOver && <EndScreen score={score} rows={rowsCleared} level={level} metrics={metrics} analysis={analysis} />}

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1200px',
        height: '90vh', // Take up most of the screen height
        padding: '20px',
        gap: '40px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Board Container - Centered and Large */}
        <div style={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: '0 0 60%', // Take 60% of the space
          maxWidth: '600px', // Prevent it from getting TOO wide on huge screens, preserving aspect ratio of tetris
        }}>
          <Board grid={grid} />
        </div>

        {/* Sidebar Container */}
        <aside style={{
          flex: '0 0 300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          height: '100%',
          paddingTop: '20px'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <Display label="Score" text={score} />
            <Display label="Rows" text={rowsCleared} />
            <Display label="Level" text={level} />
          </div>

          <StartButton callback={() => { startGame(); handleFocus(); }} />

          <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
            {/* Pass liveAnalysis to the card */}
            <CommentaryCard analysis={liveAnalysis} />
          </div>

          <div style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <p>← → to move</p>
            <p>↑ to rotate</p>
            <p>↓ to drop</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
