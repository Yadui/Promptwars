import React from 'react';
import Cell from './Cell';

const Board = ({ grid, player }) => {
    // Merge piece into the grid visually during render for performance
    const visualGrid = grid.map(row => [...row]);

    if (player && player.tetromino) {
        player.tetromino.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = y + player.pos.y;
                    const boardX = x + player.pos.x;
                    if (visualGrid[boardY] && visualGrid[boardY][boardX]) {
                        visualGrid[boardY][boardX] = [value, player.collided ? 'merged' : 'clear'];
                    }
                }
            });
        });
    }

    return (
        <div
            role="grid"
            aria-label="Tetris Board"
            style={{
                display: 'grid',
                gridTemplateRows: `repeat(${visualGrid.length}, 1fr)`,
                gridTemplateColumns: `repeat(${visualGrid[0].length}, 1fr)`,
                gridGap: '1px',
                border: '2px solid #333',
                width: '100%',
                height: '100%',
                background: '#111',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                aspectRatio: '10/20'
            }}
        >
            {visualGrid.map((row, y) =>
                row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
            )}
        </div>
    );
};

export default Board;
