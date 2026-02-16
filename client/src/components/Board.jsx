import React from 'react';
import Cell from './Cell';

const Board = ({ grid }) => (
    <div style={{
        display: 'grid',
        gridTemplateRows: `repeat(${grid.length}, 1fr)`,
        gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
        gridGap: '1px',
        border: '2px solid #333', // Use #333 directly if variable context issue, or var(--grid-line)
        width: '100%',
        height: '100%',
        background: '#111',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        aspectRatio: '10/20' // Enforce Tetris aspect ratio
    }}>
        {grid.map(row => row.map((cell, x) => <Cell key={x} type={cell[0]} />))}
    </div>
);

export default Board;
