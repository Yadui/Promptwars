import React from 'react';

const Display = ({ label, text, isGameOver }) => (
    <div style={{
        background: 'var(--card-bg)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        border: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
    }} role="status" aria-live="polite" aria-label={text}>
        <span style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px'
        }}>{label}</span>
        <span style={{
            color: isGameOver ? '#ff0055' : 'var(--text-primary)',
            fontSize: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold'
        }}>{text}</span>
    </div>
);

export default Display;
