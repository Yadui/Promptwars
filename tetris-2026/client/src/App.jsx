import React, { useRef, useState, useEffect } from 'react';
import { useTetris } from './hooks/useTetris';
import Board from './components/Board';
import Display from './components/Display';
import StartButton from './components/StartButton';
import EndScreen from './components/EndScreen';
import CommentaryCard from './components/CommentaryCard';
import NextBlock from './components/NextBlock';
import Timer from './components/Timer';
import DebugPanel from './components/DebugPanel';

import MechanicNotification from './components/MechanicNotification';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const App = () => {
  // Destructure liveAnalysis and nextTetromino from the hook
  const { grid, startGame, gameOver, score, rowsCleared, level, move, keyUp, player, metrics, liveAnalysis, nextTetromino, dropTime, isPlaying, mechanicMessage, isAnalyzing } = useTetris();
  const gameArea = useRef(null);
  const [analysis, setAnalysis] = useState(null); // Keep this for final game over analysis

  const handleFocus = () => {
    if (gameArea.current) gameArea.current.focus();
  };

  const wrapStartGame = () => {
    setAnalysis(null);
    startGame();
    handleFocus();
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

      fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (!data || !data.difficulty_adjustment) return;
          setAnalysis(data);
        })
        .catch(err => console.error("Error getting final analysis", err));
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
      <DebugPanel
        metrics={metrics}
        dropTime={dropTime}
        liveAnalysis={liveAnalysis}
        isPlaying={isPlaying}
        level={level}
        isAnalyzing={isAnalyzing}
      />

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
          position: 'relative' // For overlay positioning
        }}>
          <Board grid={grid} />

          {/* Mechanic Change Notification Overlay */}
          <MechanicNotification message={mechanicMessage} />

          {/* Start Game Overlay */}
          {!isPlaying && !gameOver && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}>
              <div style={{ width: '200px' }}>
                <StartButton callback={wrapStartGame} />
              </div>
            </div>
          )}
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
            {/* Timer with unique key to reset state */}
            <Timer key={metrics.startTime || 'idle'} startTime={metrics.startTime} gameOver={gameOver} />

            {/* Next Block */}
            {isPlaying && nextTetromino && <NextBlock tetromino={nextTetromino.shape} />}

            <Display label="Score" text={score} />
            <Display label="Rows" text={rowsCleared} />
            <Display label="Level" text={level} />
          </div>

          <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
            {/* Pass liveAnalysis to the card */}
            <CommentaryCard analysis={liveAnalysis} />
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            <p>← → to move</p>
            <p>↑ to rotate</p>
            <p>↓ to drop</p>
            <p style={{ marginTop: '10px', opacity: 0.6 }}>Session: {player.gameId || 'awaiting link...'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
