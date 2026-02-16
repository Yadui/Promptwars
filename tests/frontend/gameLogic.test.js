const {
    createGrid,
    calculateMetrics,
    checkCollision,
    rotate,
    BOARD_WIDTH,
    BOARD_HEIGHT
} = require('../../client/src/utils/gameLogic');

describe('Frontend Game Logic', () => {

    describe('createGrid', () => {
        test('creates a grid of correct dimensions', () => {
            const grid = createGrid();
            expect(grid.length).toBe(BOARD_HEIGHT);
            expect(grid[0].length).toBe(BOARD_WIDTH);
            expect(grid[0][0]).toEqual([0, 'clear']);
        });
    });

    describe('calculateMetrics', () => {
        test('calculates correct maxStackHeight and unevenness', () => {
            const grid = createGrid();
            // Simulate a simple stack
            // Column 0: height 2
            grid[BOARD_HEIGHT - 1][0] = [1, 'merged'];
            grid[BOARD_HEIGHT - 2][0] = [1, 'merged'];
            // Column 1: height 1
            grid[BOARD_HEIGHT - 1][1] = [1, 'merged'];

            const metrics = calculateMetrics(grid);
            expect(metrics.maxStackHeight).toBe(2);
            expect(metrics.unevenness).toBe(2); // |2-1| + |1-0| = 2 correctly
        });

        test('handles empty grid', () => {
            const metrics = calculateMetrics(createGrid());
            expect(metrics.maxStackHeight).toBe(0);
            expect(metrics.unevenness).toBe(0);
        });
    });

    describe('checkCollision', () => {
        const player = {
            pos: { x: 0, y: 0 },
            tetromino: [
                [1, 1],
                [1, 1]
            ]
        };

        test('detects wall collision (left)', () => {
            expect(checkCollision(player, createGrid(), { x: -1, y: 0 })).toBe(true);
        });

        test('detects wall collision (right)', () => {
            expect(checkCollision(player, createGrid(), { x: BOARD_WIDTH, y: 0 })).toBe(true);
        });

        test('detects floor collision', () => {
            expect(checkCollision(player, createGrid(), { x: 0, y: BOARD_HEIGHT })).toBe(true);
        });

        test('detects piece collision', () => {
            const grid = createGrid();
            grid[1][0] = [1, 'merged'];
            expect(checkCollision(player, grid, { x: 0, y: 0 })).toBe(true);
        });

        test('no collision in empty space', () => {
            expect(checkCollision(player, createGrid(), { x: 5, y: 5 })).toBe(false);
        });
    });

    describe('rotate', () => {
        test('rotates a matrix correctly (clockwise)', () => {
            const matrix = [
                [1, 0],
                [0, 0]
            ];
            const rotated = rotate(matrix, 1);
            expect(rotated).toEqual([
                [0, 1],
                [0, 0]
            ]);
        });

        test('rotates a matrix correctly (counter-clockwise)', () => {
            const matrix = [
                [1, 0],
                [0, 0]
            ];
            const rotated = rotate(matrix, -1);
            expect(rotated).toEqual([
                [0, 0],
                [1, 0]
            ]);
        });
    });

    describe('Edge Cases', () => {
        test('Game over detection (colliding at spawn)', () => {
            const grid = createGrid();
            // Fill the top row
            for (let x = 0; x < BOARD_WIDTH; x++) grid[0][x] = [1, 'merged'];

            const player = {
                pos: { x: 0, y: 0 },
                tetromino: [[1]]
            };
            expect(checkCollision(player, grid, { x: 0, y: 0 })).toBe(true);
        });
    });
});
