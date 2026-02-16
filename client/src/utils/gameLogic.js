export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createGrid() {
    return Array.from(Array(BOARD_HEIGHT), () =>
        new Array(BOARD_WIDTH).fill([0, 'clear'])
    );
}

export function calculateMetrics(grid) {
    let maxStackHeight = 0;
    let unevenness = 0;
    let heights = new Array(BOARD_WIDTH).fill(0);

    for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            if (grid[y] && grid[y][x] && grid[y][x][1] === 'merged') {
                heights[x] = BOARD_HEIGHT - y;
                break;
            }
        }
    }

    maxStackHeight = Math.max(...heights);

    for (let x = 0; x < BOARD_WIDTH - 1; x++) {
        unevenness += Math.abs(heights[x] - heights[x + 1]);
    }

    return { maxStackHeight, unevenness };
}

export function checkCollision(player, grid, { x: moveX, y: moveY }) {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            if (player.tetromino[y][x] !== 0) {
                const nextX = x + moveX;
                const nextY = y + moveY;

                if (
                    nextY >= BOARD_HEIGHT ||
                    nextX < 0 ||
                    nextX >= BOARD_WIDTH ||
                    (grid[nextY] &&
                        grid[nextY][nextX] &&
                        grid[nextY][nextX][1] !== 'clear')
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function rotate(matrix, dir) {
    const rotated = matrix.map((_, index) =>
        matrix.map((col) => col[index])
    );

    if (dir > 0) return rotated.map((row) => row.reverse());
    return rotated.reverse();
}
