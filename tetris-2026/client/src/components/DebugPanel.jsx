import React from 'react';

const DebugPanel = ({ metrics, dropTime, liveAnalysis, isPlaying, level }) => {
    return (
        <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            color: '#0f0',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 100,
            maxWidth: '250px',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.1)'
        }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px', color: '#fff' }}>
                DEBUG: AI STATE
            </h3>

            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Game Status:</strong>
                <br />
                Playing: {isPlaying ? 'YES' : 'NO'}<br />
                Level: {level}<br />
                Drop Time: {dropTime ? `${Math.round(dropTime)}ms` : 'PAUSED'}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>Live Metrics:</strong>
                <br />
                Lines: {metrics.linesCleared}<br />
                Rotations: {metrics.rotationCount}<br />
                Panic Placements: {metrics.placements.filter(p => p.isPanic).length}<br />
                Avg Placement: {metrics.placements.length > 0
                    ? Math.round(metrics.placements.reduce((a, b) => a + b.timeTaken, 0) / metrics.placements.length) + 'ms'
                    : 'N/A'}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#fff' }}>AI Analysis:</strong>
                <br />
                <span style={{ color: liveAnalysis.difficulty_adjustment === 'active' ? '#0f0' : '#888' }}>
                    Diff. Adj: {liveAnalysis.difficulty_adjustment}
                </span>
                <br />
                <div style={{ marginTop: '5px', fontSize: '10px', color: '#aaa', fontStyle: 'italic' }}>
                    "{liveAnalysis.commentary}"
                </div>
            </div>
        </div>
    );
};

export default DebugPanel;
