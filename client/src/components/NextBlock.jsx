import React from 'react';
import Cell from './Cell';

const NextBlock = ({ tetromino }) => {
    return (
        <div style={{
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <h3 style={{
                margin: '0 0 16px 0',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                width: '100%',
                textAlign: 'left'
            }}>Next</h3>

            <div style={{
                display: 'grid',
                gridTemplateRows: `repeat(${tetromino.length}, 1fr)`,
                gridTemplateColumns: `repeat(${tetromino[0].length}, 1fr)`,
                gridGap: '1px',
                width: '80px', // Fixed small size
                background: 'rgba(0,0,0,0.5)',
            }}>
                {tetromino.map((row, y) =>
                    row.map((cell, x) => (
                        <div key={`${y}-${x}`} style={{
                            width: '20px',
                            height: '20px',
                            background: cell !== 0
                                ? `rgba(${{
                                    I: '80, 227, 230',
                                    J: '36, 95, 223',
                                    L: '223, 173, 36',
                                    O: '223, 217, 36',
                                    S: '48, 211, 56',
                                    T: '132, 61, 198',
                                    Z: '227, 78, 78',
                                }[cell] || '0,0,0'}, 1)`
                                : 'transparent',
                            border: cell !== 0 ? '1px solid rgba(0,0,0,0.1)' : 'none',
                        }} />
                    ))
                )}
            </div>
        </div>
    );
};

export default NextBlock;
