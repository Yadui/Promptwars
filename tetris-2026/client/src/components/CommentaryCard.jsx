import React from 'react';

const CommentaryCard = ({ analysis }) => {
    return (
        <div style={{
            background: 'rgba(0, 240, 255, 0.05)',
            border: '1px solid var(--accent-color)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '24px',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.2)',
            transition: 'all 0.3s ease'
        }}>
            <h3 style={{
                margin: '0 0 12px 0',
                color: 'var(--accent-color)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--accent-color)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--accent-color)'
                }}></span>
                AI Analysis
            </h3>

            <div style={{ marginBottom: '16px' }}>
                <span style={{
                    color: '#888',
                    fontSize: '0.8rem',
                    display: 'block',
                    marginBottom: '4px'
                }}>Cognitive State</span>
                <span style={{
                    color: '#fff',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                }}>{analysis.cognitive_profile}</span>
            </div>

            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: '#ddd',
                borderLeft: '2px solid var(--accent-color)',
                paddingLeft: '12px'
            }}>
                "{analysis.commentary}"
            </div>
        </div>
    );
};

export default CommentaryCard;
