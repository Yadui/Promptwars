import React from 'react';

const EndScreen = ({ score, rows, level, metrics, analysis }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            zIndex: 100
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#ff3333' }}>GAME OVER</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', maxWidth: '800px' }}>
                <div>
                    <h2>Stats</h2>
                    <p>Score: {score}</p>
                    <p>Lines: {rows}</p>
                    <p>Level: {level}</p>
                    <p>Avg Time: {metrics.placements.length > 0 ? (metrics.placements.reduce((a, b) => a + b.timeTaken, 0) / metrics.placements.length).toFixed(0) : 0}ms</p>
                    <p>Panic Moves: {metrics.placements.filter(p => p.isPanic).length}</p>
                </div>

                <div>
                    <h2 style={{ color: '#80e3e6' }}>Cognitive Profile</h2>
                    {analysis ? (
                        <>
                            <h3 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{analysis.cognitive_profile}</h3>
                            <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>"{analysis.commentary}"</p>
                            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #333' }}>
                                <small>Adjustment: {analysis.difficulty_adjustment}</small>
                            </div>
                        </>
                    ) : (
                        <p>Analyzing gameplay data...</p>
                    )}
                </div>
            </div>

            <button
                onClick={() => window.location.reload()}
                style={{
                    marginTop: '60px',
                    padding: '20px 40px',
                    fontSize: '1.2rem',
                    background: '#333',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                }}
            >
                Play Again
            </button>
        </div>
    );
};

export default EndScreen;
