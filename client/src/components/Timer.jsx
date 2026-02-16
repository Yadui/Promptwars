import React, { useState, useEffect } from 'react';

const Timer = ({ startTime, gameOver }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (!startTime || gameOver) return;

        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, gameOver]);

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            background: 'var(--card-bg)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <span style={{
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '4px'
            }}>Time</span>
            <span style={{
                color: 'var(--accent-color)',
                fontSize: '1.25rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 'bold',
                textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
            }}>{formatTime(elapsed)}</span>
        </div>
    );
};

export default Timer;
