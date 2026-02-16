// Mock metrics calculation logic from useTetris
const calculateMetrics = (grid) => {
    let maxStackHeight = 0;
    let unevenness = 0;
    let heights = new Array(10).fill(0); // Assuming width 10
    const BOARD_HEIGHT = 20;

    // Calculate column heights
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            if (grid[y][x][1] === 'merged') {
                heights[x] = BOARD_HEIGHT - y;
                break;
            }
        }
    }
    maxStackHeight = Math.max(...heights);

    // Calculate unevenness
    for (let x = 0; x < 10 - 1; x++) {
        unevenness += Math.abs(heights[x] - heights[x + 1]);
    }

    return { maxStackHeight, unevenness };
};

describe('Metrics Calculation', () => {
    test('calculateMetrics correctly calculates unevenness and max height', () => {
        // Create an empty grid
        const grid = Array.from(Array(20), () => new Array(10).fill([0, 'clear']));

        // Simulate some merged blocks
        // Column 0 height 2
        grid[18][0] = [1, 'merged'];
        grid[19][0] = [1, 'merged'];

        // Column 1 height 4
        grid[16][1] = [1, 'merged'];
        grid[17][1] = [1, 'merged'];
        grid[18][1] = [1, 'merged'];
        grid[19][1] = [1, 'merged'];

        const { maxStackHeight, unevenness } = calculateMetrics(grid);

        expect(maxStackHeight).toBe(4);
        // Unevenness: |2 - 4| + |4 - 0| + ... = 2 + 4 = 6
        expect(unevenness).toBe(6);
    });

    test('calculateMetrics handles empty grid', () => {
        const grid = Array.from(Array(20), () => new Array(10).fill([0, 'clear']));
        const { maxStackHeight, unevenness } = calculateMetrics(grid);
        expect(maxStackHeight).toBe(0);
        expect(unevenness).toBe(0);
    });
});
