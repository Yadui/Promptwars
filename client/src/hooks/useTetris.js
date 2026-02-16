import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

import { TETROMINOS, randomTetromino } from '../utils/tetrominos';
import { createGrid, calculateMetrics, checkCollision, rotate } from '../utils/gameLogic';

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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const baseDropTimeRef = useRef(800);

    const [liveAnalysis, setLiveAnalysis] = useState({
        cognitive_profile: "System Read",
        commentary: "Press Start to enable neural link...",
        difficulty_adjustment: "ready"
    });

    // Sync refs for synchronous access in event handlers (prevents stale closures)
    const playerRef = useRef(player);
    const gridRef = useRef(grid);

    useEffect(() => {
        playerRef.current = player;
    }, [player]);

    useEffect(() => {
        gridRef.current = grid;
    }, [grid]);

    const playerRotate = (targetGrid, dir) => {
        const currentRefPlayer = playerRef.current;
        const clonedPlayer = {
            ...currentRefPlayer,
            tetromino: rotate(currentRefPlayer.tetromino, dir),
            pos: { ...currentRefPlayer.pos }
        };

        let offset = 1;
        while (checkCollision(clonedPlayer, targetGrid, { x: clonedPlayer.pos.x, y: clonedPlayer.pos.y })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));

            if (offset > clonedPlayer.tetromino[0].length) {
                return;
            }
        }

        playerRef.current = clonedPlayer; // Immediate ref update for concurrent moves
        setPlayer(clonedPlayer);
        setMetrics(prev => ({ ...prev, rotationCount: prev.rotationCount + 1 }));
    };

    const resetPlayer = useCallback(() => {
        const tetromino = nextTetromino.shape;
        setNextTetromino(randomTetromino());
        const newPlayer = {
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino,
            collided: false,
        };

        // If it collides on spawn, game over - Use Ref for Grid to avoid dependency loop
        if (checkCollision(newPlayer, gridRef.current, { x: newPlayer.pos.x, y: newPlayer.pos.y })) {
            setGameOver(true);
            setDropTime(null);
            setIsPlaying(false);
        }

        playerRef.current = newPlayer;
        setPlayer(newPlayer);
        setPieceSpawnTime(Date.now());
    }, [nextTetromino]); // Removed 'grid' from dependencies

    const sweepRows = (newGrid) => {
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
                ack.unshift(new Array(newGrid[0].length).fill([0, 'clear']));
                return ack;
            }
            ack.push(row);
            return ack;
        }, []);
        return ack;
    };

    // UseEffect is now ONLY for handling collisions/merging
    useEffect(() => {
        if (player.collided) {
            setGrid(prev => {
                const newGrid = [...prev.map(row => [...row])];
                // Draw piece to grid permanently
                player.tetromino.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value !== 0) {
                            newGrid[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
                        }
                    });
                });

                const sweptGrid = sweepRows(newGrid);

                // Placement metrics
                const timeTaken = Date.now() - pieceSpawnTime;
                const isPanic = timeTaken < 300;
                const { maxStackHeight, unevenness } = calculateMetrics(sweptGrid);

                setMetrics(prev => ({
                    ...prev,
                    placements: [...prev.placements, { timeTaken, isPanic }],
                    maxStackHeight,
                    unevenness
                }));

                // Reset player AFTER grid is updated to avoid spawn race
                setTimeout(resetPlayer, 0);
                return sweptGrid;
            });
        }
    }, [player.collided, pieceSpawnTime, resetPlayer]);

    const startGame = () => {
        setGrid(createGrid());
        setGameOver(false);
        setIsPlaying(true);
        setScore(0);
        setRowsCleared(0);
        setLevel(0);
        setDropTime(800);
        baseDropTimeRef.current = 800;
        setGameId(Math.random().toString(36).substr(2, 9));
        setMetrics({
            linesCleared: 0,
            startTime: Date.now(),
            placements: [],
            rotationCount: 0,
            maxStackHeight: 0,
            unevenness: 0,
        });
        const newPlayer = {
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        };
        playerRef.current = newPlayer;
        setPlayer(newPlayer);
    };

    const drop = useCallback(() => {
        const currentRefPlayer = playerRef.current;
        const currentRefGrid = gridRef.current;

        if (!checkCollision(currentRefPlayer, currentRefGrid, { x: currentRefPlayer.pos.x, y: currentRefPlayer.pos.y + 1 })) {
            const nextPlayer = {
                ...currentRefPlayer,
                pos: { x: currentRefPlayer.pos.x, y: currentRefPlayer.pos.y + 1 },
                collided: false
            };
            playerRef.current = nextPlayer;
            setPlayer(nextPlayer);
        } else {
            const collidedPlayer = { ...currentRefPlayer, collided: true };
            playerRef.current = collidedPlayer;
            setPlayer(collidedPlayer);
        }
    }, []);

    const move = ({ keyCode }) => {
        if (!gameOver) {
            const currentRefGrid = gridRef.current;

            if (keyCode === 37) { // Left
                const currentRefPlayer = playerRef.current;
                if (!checkCollision(currentRefPlayer, currentRefGrid, { x: currentRefPlayer.pos.x - 1, y: currentRefPlayer.pos.y })) {
                    const nextPlayer = { ...currentRefPlayer, pos: { x: currentRefPlayer.pos.x - 1, y: currentRefPlayer.pos.y } };
                    playerRef.current = nextPlayer;
                    setPlayer(nextPlayer);
                }
            }

            if (keyCode === 39) { // Right
                const currentRefPlayer = playerRef.current;
                if (!checkCollision(currentRefPlayer, currentRefGrid, { x: currentRefPlayer.pos.x + 1, y: currentRefPlayer.pos.y })) {
                    const nextPlayer = { ...currentRefPlayer, pos: { x: currentRefPlayer.pos.x + 1, y: currentRefPlayer.pos.y } };
                    playerRef.current = nextPlayer;
                    setPlayer(nextPlayer);
                }
            }

            if (keyCode === 40) { // Down
                if (dropTime !== 50) {
                    setDropTime(50);
                    drop(); // Move immediately once
                }
            }

            if (keyCode === 38) { // Up
                playerRotate(currentRefGrid, 1);
            }
        }
    };

    const keyUp = ({ keyCode }) => {
        if (!gameOver && keyCode === 40) {
            // Trigger drop immediately to avoid delay when resuming gravity
            drop();
            setDropTime(baseDropTimeRef.current);
        }
    };



    const [mechanicMessage, setMechanicMessage] = useState(null);
    const metricsRef = useRef(metrics);
    useEffect(() => {
        metricsRef.current = metrics;
    }, [metrics]);

    const gameIdRef = useRef(gameId);
    useEffect(() => {
        gameIdRef.current = gameId;
    }, [gameId]);

    const applyDifficultyAdjustment = useCallback((adjustment) => {
        if (adjustment === 'increase') {
            baseDropTimeRef.current = Math.max(100, baseDropTimeRef.current * 0.8);
            setDropTime(baseDropTimeRef.current);
            setMechanicMessage("SPEED UP!");
        } else if (adjustment === 'decrease') {
            baseDropTimeRef.current = Math.min(1000, baseDropTimeRef.current * 1.2);
            setDropTime(baseDropTimeRef.current);
            setMechanicMessage("SLOWING DOWN...");
        } else if (adjustment === 'spike') {
            setDropTime(baseDropTimeRef.current * 0.5);
            setMechanicMessage("ADRENALINE SPIKE!");
            setTimeout(() => setDropTime(baseDropTimeRef.current), 5000);
        }

        if (adjustment !== 'maintain') {
            setTimeout(() => setMechanicMessage(null), 3000);
        }
    }, []);

    const analyze = useCallback(async (payload) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch(`${API_URL}/api/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.cognitive_profile || !data.difficulty_adjustment || !data.commentary) {
                throw new Error("Incomplete AI response");
            }

            return data;
        } catch (error) {
            console.error("Analysis failed:", error);
            return {
                cognitive_profile: "Unknown",
                difficulty_adjustment: "maintain",
                commentary: "AI unavailable. Continuing standard mode."
            };
        } finally {
            setIsAnalyzing(false);
        }
    }, []);

    // Send metrics to backend
    useEffect(() => {
        const interval = setInterval(async () => {
            const currentMetrics = metricsRef.current;
            const currentGameId = gameIdRef.current;

            // Frontend Validation
            if (
                !gameOver &&
                currentMetrics.placements.length > 0 &&
                typeof currentMetrics.linesCleared === 'number'
            ) {
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

                const data = await analyze(payload);

                // Re-render prevention & State isolation
                setLiveAnalysis(prev => {
                    if (
                        prev.commentary === data.commentary &&
                        prev.difficulty_adjustment === data.difficulty_adjustment
                    ) {
                        return prev;
                    }
                    return data;
                });

                applyDifficultyAdjustment(data.difficulty_adjustment);

                // Reset interval-based metrics
                setMetrics(prev => ({ ...prev, placements: [] }));
            }
        }, 15000); // Optimized 15s polling
        return () => clearInterval(interval);
    }, [gameOver, analyze, applyDifficultyAdjustment]); // Stable dependencies

    // Game Loop - Optimized to not reset on player change
    const dropRef = useRef(drop);
    useEffect(() => {
        dropRef.current = drop;
    }, [drop]);

    useEffect(() => {
        if (!gameOver && dropTime) {
            const interval = setInterval(() => {
                dropRef.current();
            }, dropTime);
            return () => clearInterval(interval);
        }
    }, [dropTime, gameOver]);

    return { grid, startGame, gameOver, score, rowsCleared, level, move, keyUp, player, metrics, liveAnalysis, nextTetromino, dropTime, isPlaying, mechanicMessage, isAnalyzing };
};
