import React from 'react';
import { TETROMINOS } from '../utils/tetrominos';

const Cell = ({ type }) => {
    const color = TETROMINOS[type] ? TETROMINOS[type].color : '0, 0, 0';
    return (
        <div
            role="gridcell"
            aria-label={type === 0 ? "Empty cell" : `Tetromino cell type ${type}`}
            style={{
                width: 'auto',
                background: `rgba(${color}, 0.8)`,
                border: `${type === 0 ? '0px solid' : '4px solid'}`,
                borderBottomColor: `rgba(${color}, 0.1)`,
                borderRightColor: `rgba(${color}, 1)`,
                borderTopColor: `rgba(${color}, 1)`,
                borderLeftColor: `rgba(${color}, 0.3)`,
                boxShadow: type === 0 ? 'none' : 'inset 0 0 8px rgba(0, 0, 0, 0.25)', // Slight inner shadow
            }}
        />
    );
}

export default React.memo(Cell);
