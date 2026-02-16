import React from 'react';

const StartButton = ({ callback }) => (
    <button
        onClick={callback}
        style={{
            boxSizing: 'border-box',
            margin: '0 0 20px 0',
            padding: '16px 32px',
            minHeight: '30px',
            width: '100%',
            borderRadius: '99px',
            border: 'none',
            color: 'white',
            background: 'var(--accent-color)',
            fontFamily: 'var(--font-main)',
            fontSize: '1rem',
            fontWeight: '600',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
        }}
        onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.6)';
        }}
        onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
        }}
    >
        Start Game
    </button>
)

export default StartButton;
