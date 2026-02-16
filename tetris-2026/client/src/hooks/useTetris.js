import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

import { TETROMINOS, randomTetromino } from '../utils/tetrominos';

export const useTetris = () => {
    const [grid, setGrid] = useState(createGrid());
    const [nextTetromino, setNextTetromino] = useState(randomTetromino());
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [dropTime, setDropTime] = useState(null);
    const [score, setScore] = useState(0);
    const [rowsCleared, setRowsCleared] = useState(0);
    const [level, setLevel] = useState(0);

    // Metrics tracking
    const [metrics, setMetrics] = useState({
        linesCleared: 0,
        startTime: null,
        placements: [], // { timeTaken, isPanic, rotationCount }
        rotationCount: 0,
        maxStackHeight: 0,
        unevenness: 0,
    });

    const [pieceSpawnTime, setPieceSpawnTime] = useState(Date.now());
    const [gameId, setGameId] = useState(null);

    const [liveAnalysis, setLiveAnalysis] = useState({
        cognitive_profile: "System Read",
        commentary: "Press Start to enable neural link...",
        difficulty_adjustment: "ready"
    });

    function createGrid() {
        return Array.from(Array(BOARD_HEIGHT), () =>
            new Array(BOARD_WIDTH).fill([0, 'clear'])
        );
    }

    const calculateMetrics = (grid) => {
        let maxStackHeight = 0;
        let unevenness = 0;
        let heights = new Array(BOARD_WIDTH).fill(0);

        // Calculate column heights
        for (let x = 0; x < BOARD_WIDTH; x++) {
            for (let y = 0; y < BOARD_HEIGHT; y++) {
                if (grid[y][x][1] === 'merged') {
                    heights[x] = BOARD_HEIGHT - y;
                    break;
                }
            }
        }
        maxStackHeight = Math.max(...heights);

        // Calculate unevenness
        for (let x = 0; x < BOARD_WIDTH - 1; x++) {
            unevenness += Math.abs(heights[x] - heights[x + 1]);
        }

        return { maxStackHeight, unevenness };
    };

    const movePlayer = (dir) => {
        const newX = player.pos.x + dir;
        const newY = player.pos.y;
        if (!checkCollision(player, grid, { x: newX, y: newY })) {
            updatePlayerPos({ x: newX, y: newY, collided: false });
        }
    };

    const startGame = () => {
        setGrid(createGrid());
        const next = randomTetromino();
        setNextTetromino(next);
        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
        setGameOver(false);
        setIsPlaying(true);
        setScore(0);
        setRowsCleared(0);
        setLevel(0);
        setDropTime(800);
        setMetrics({
            linesCleared: 0,
            startTime: Date.now(),
            placements: [],
            rotationCount: 0,
            maxStackHeight: 0,
            unevenness: 0,
        });
        setPieceSpawnTime(Date.now());

        // Generate a simple unique Game ID
        const newGameId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setGameId(newGameId);

        setLiveAnalysis({
            cognitive_profile: "Syncing...",
            commentary: "Neural link established. Awaiting input patterns.",
            difficulty_adjustment: "calibrating"
        });
    };

    const resetPlayer = () => {
        setPieceSpawnTime(Date.now());
        const newTetromino = nextTetromino || randomTetromino(); // Use next or random if undefined
        setNextTetromino(randomTetromino()); // Generate new next piece

        return {
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: newTetromino.shape,
            collided: false,
        };
    };

    const updatePlayerPos = ({ x, y, collided }) => {
        setPlayer((prev) => ({
            ...prev,
            pos: { x, y }, // Use absolute coordinates
            collided,
        }));
    };

    const checkCollision = (player, grid, { x: moveX, y: moveY }) => {
        // moveX and moveY are now ABSOLUTE coordinates for the player position
        // We are checking if the player WAS at {moveX, moveY}, would it collide?

        for (let y = 0; y < player.tetromino.length; y += 1) {
            for (let x = 0; x < player.tetromino[y].length; x += 1) {
                // 1. Check that we're on an actual Tetromino cell
                if (player.tetromino[y][x] !== 0) {

                    const nextX = x + moveX;
                    const nextY = y + moveY;

                    if (
                        // 2. Check that our move is inside the game areas height (y)
                        // We strictly check bounds first to avoid undefined access
                        nextY >= BOARD_HEIGHT ||
                        // 3. Check that our move is inside the game areas width (x)
                        nextX < 0 ||
                        nextX >= BOARD_WIDTH ||
                        // 4. Check if the cell is already occupied (not clear)
                        // We must ensure grid[nextY] exists before checking [nextX]
                        (grid[nextY] && grid[nextY][nextX] && grid[nextY][nextX][1] !== 'clear')
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    const drop = () => {
        // Increase level when player has cleared 10 rows
        if (rowsCleared > (level + 1) * 10) {
            setLevel((prev) => prev + 1);
            setDropTime(1000 / (level + 1) + 200);
        }

        const newX = player.pos.x;
        const newY = player.pos.y + 1;

        if (!checkCollision(player, grid, { x: newX, y: newY })) {
            updatePlayerPos({ x: newX, y: newY, collided: false });
        } else {
            // Game Over
            if (player.pos.y < 1) {
                setGameOver(true);
                setIsPlaying(false);
                setDropTime(null);
            }
            updatePlayerPos({ x: player.pos.x, y: player.pos.y, collided: true });
        }
    };

    const keyUp = ({ keyCode }) => {
        if (!gameOver) {
            // Activate the interval again when user releases down arrow
            // if (keyCode === 40) {
            //     setDropTime(1000 / (level + 1) + 200);
            // }
        }
    };

    const dropPlayer = () => {
        // We don't stop the interval anymore, we just add extra drops
        // setDropTime(null);
        drop();
    };

    const move = ({ keyCode }) => {
        if (!gameOver) {
            // First move check
            if (metrics.placements.length === 0 && metrics.rotationCount === 0 && score === 0 && liveAnalysis.difficulty_adjustment === 'calibrating') {
                setLiveAnalysis(prev => ({
                    ...prev,
                    cognitive_profile: "Analyzing...",
                    commentary: "First input detected. Profiling reaction time.",
                    difficulty_adjustment: "active"
                }));
            }

            if (keyCode === 37) {
                movePlayer(-1);
            } else if (keyCode === 39) {
                movePlayer(1);
            } else if (keyCode === 40) {
                dropPlayer();
            } else if (keyCode === 38) {
                playerRotate(grid, 1);
            }
        }
    };

    const playerRotate = (grid, dir) => {
        // deep clone
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        // Wall kick logic
        const pos = clonedPlayer.pos.x;
        let offset = 1;

        // We check collision for the ROTATED piece at current position
        while (checkCollision(clonedPlayer, grid, { x: clonedPlayer.pos.x, y: clonedPlayer.pos.y })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));

            // If we've moved too far trying to find a spot, abort rotation
            if (offset > clonedPlayer.tetromino[0].length) {
                // Rotate back
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }

        setPlayer(clonedPlayer);
        setMetrics(prev => ({ ...prev, rotationCount: prev.rotationCount + 1 }));
    };

    const rotate = (matrix, dir) => {
        // Transpose rows to cols
        const rotated = matrix.map((_, index) =>
            matrix.map((col) => col[index])
        );
        // Reverse each row to get a rotated matrix
        if (dir > 0) return rotated.map((row) => row.reverse());
        return rotated.reverse();
    };

    useEffect(() => {
        const sweepRows = (newGrid) => {
            let sweptRows = 0;
            const ack = newGrid.reduce((ack, row) => {
                if (row.findIndex((cell) => cell[0] === 0) === -1) {
                    setRowsCleared((prev) => prev + 1);
                    setMetrics(prev => {
                        const newLinesCleared = prev.linesCleared + 1;
                        if (newLinesCleared === 1) {
                            setLiveAnalysis(current => ({
                                ...current,
                                cognitive_profile: "Flow State Detection",
                                commentary: "First clear achieved. Neuro-plasticity limiters disengaged.",
                                difficulty_adjustment: "optimizing"
                            }));
                        }
                        return { ...prev, linesCleared: newLinesCleared };
                    });
                    sweptRows += 1;
                    ack.unshift(new Array(newGrid[0].length).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);
            return ack;
        };

        const updateGrid = (prevGrid) => {
            // First flush the grid
            const newGrid = prevGrid.map((row) =>
                row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            // Then draw the tetromino
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newGrid[y + player.pos.y][x + player.pos.x] = [
                            value,
                            `${player.collided ? 'merged' : 'clear'}`,
                        ];
                    }
                });
            });

            // Then check if we collided
            if (player.collided) {
                const sweptGrid = sweepRows(newGrid);

                // Track placement metrics
                const timeTaken = Date.now() - pieceSpawnTime;
                const isPanic = timeTaken < 300;

                const { maxStackHeight, unevenness } = calculateMetrics(sweptGrid);

                setMetrics(prev => ({
                    ...prev,
                    placements: [...prev.placements, { timeTaken, isPanic }],
                    maxStackHeight,
                    unevenness
                }));

                setPlayer(resetPlayer());
                return sweptGrid;
            }

            return newGrid;
        };

        setGrid((prev) => updateGrid(prev));
    }, [player.collided, player.pos, player.tetromino, player.pos.x, player.pos.y]);



    const [mechanicMessage, setMechanicMessage] = useState(null);
    const metricsRef = useRef(metrics);
    useEffect(() => {
        metricsRef.current = metrics;
    }, [metrics]);

    const gameIdRef = useRef(gameId);
    useEffect(() => {
        gameIdRef.current = gameId;
    }, [gameId]);

    // Send metrics to backend
    useEffect(() => {
        const interval = setInterval(() => {
            const currentMetrics = metricsRef.current;
            const currentGameId = gameIdRef.current;

            if (!gameOver && currentMetrics.placements.length > 0) {
                // Calculate derived metrics
                const avgPlacementTime = currentMetrics.placements.reduce((acc, p) => acc + p.timeTaken, 0) / currentMetrics.placements.length || 0;
                const panicCount = currentMetrics.placements.filter(p => p.isPanic).length;

                const payload = {
                    gameId: currentGameId,
                    metrics: {
                        linesCleared: currentMetrics.linesCleared,
                        avgPlacementTime,
                        rotationCount: currentMetrics.rotationCount,
                        maxStackHeight: currentMetrics.maxStackHeight,
                        panicPlacements: panicCount,
                        boardUnevenness: currentMetrics.unevenness
                    }
                };

                console.log("Sending metrics:", payload);
                fetch(`${API_URL}/api/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("Analysis:", data);
                        setLiveAnalysis(data); // Update live analysis

                        if (data.difficulty_adjustment === 'increase') {
                            setDropTime(prev => Math.max(100, (prev || 800) * 0.9));
                            setMechanicMessage("SPEED UP!");
                        } else if (data.difficulty_adjustment === 'decrease') {
                            setDropTime(prev => Math.min(1000, (prev || 800) * 1.1));
                            setMechanicMessage("SLOWING DOWN...");
                        } else if (data.difficulty_adjustment === 'spike') {
                            setDropTime(prev => Math.max(50, (prev || 800) * 0.5));
                            setMechanicMessage("ADRENALINE SPIKE!");
                            setTimeout(() => setDropTime(prev => (prev || 400) * 2), 5000); // 5s spike
                        }

                        // Clear message after 3 seconds
                        if (data.difficulty_adjustment !== 'maintain') {
                            setTimeout(() => setMechanicMessage(null), 3000);
                        }
                    })
                    .catch(err => console.error("Error sending metrics", err));
            }
        }, 5000); // 5s interval for faster feedback
        return () => clearInterval(interval);
    }, [gameOver]); // Only depends on gameOver status now

    // Game Loop
    useEffect(() => {
        if (!gameOver && dropTime) {
            const interval = setInterval(() => {
                drop();
            }, dropTime);
            return () => {
                clearInterval(interval);
            };
        }
    }, [dropTime, gameOver, drop]); // eslint-disable-next-line

    return { grid, startGame, gameOver, score, rowsCleared, level, move, keyUp, player, metrics, liveAnalysis, nextTetromino, dropTime, isPlaying, mechanicMessage };
};
