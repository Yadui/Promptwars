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

    const playerRotate = (grid, dir) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        let offset = 1;

        while (checkCollision(clonedPlayer, grid, { x: clonedPlayer.pos.x, y: clonedPlayer.pos.y })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));

            if (offset > clonedPlayer.tetromino[0].length) {
                // We don't need the inner rotate back here if we cloned, 
                // but let's keep it similar to original logic if preferred.
                return;
            }
        }
        setPlayer(clonedPlayer);
        setMetrics(prev => ({ ...prev, rotationCount: prev.rotationCount + 1 }));
    };

    useEffect(() => {
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
    }, [player.collided, player.pos, player.tetromino, player.pos.x, player.pos.y, pieceSpawnTime, resetPlayer]);

    const resetPlayer = useCallback(() => {
        const tetromino = nextTetromino.shape;
        setNextTetromino(randomTetromino());
        const newPlayer = {
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino,
            collided: false,
        };

        // If it collides on spawn, game over
        if (checkCollision(newPlayer, grid, { x: 0, y: 0 })) {
            setGameOver(true);
            setDropTime(null);
            setIsPlaying(false);
        }

        setPlayer(newPlayer);
        setPieceSpawnTime(Date.now());
    }, [nextTetromino, grid]);

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
        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
    };

    const drop = useCallback(() => {
        if (!checkCollision(player, grid, { x: 0, y: 1 })) {
            setPlayer(prev => ({
                ...prev,
                pos: { x: prev.pos.x, y: prev.pos.y + 1 },
                collided: false
            }));
        } else {
            setPlayer(prev => ({ ...prev, collided: true }));
        }
    }, [player, grid]);

    const move = ({ keyCode }) => {
        if (!gameOver) {
            if (keyCode === 37) { // Left
                if (!checkCollision(player, grid, { x: -1, y: 0 })) {
                    setPlayer(prev => ({ ...prev, pos: { x: prev.pos.x - 1, y: prev.pos.y } }));
                }
            } else if (keyCode === 39) { // Right
                if (!checkCollision(player, grid, { x: 1, y: 0 })) {
                    setPlayer(prev => ({ ...prev, pos: { x: prev.pos.x + 1, y: prev.pos.y } }));
                }
            } else if (keyCode === 40) { // Down
                setDropTime(null);
                drop();
            } else if (keyCode === 38) { // Up
                playerRotate(grid, 1);
            }
        }
    };

    const keyUp = ({ keyCode }) => {
        if (!gameOver && keyCode === 40) {
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
        }, 30000); // Optimized 30s polling
        return () => clearInterval(interval);
    }, [gameOver, analyze, applyDifficultyAdjustment]); // Stable dependencies

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
    }, [dropTime, gameOver, drop]);

    return { grid, startGame, gameOver, score, rowsCleared, level, move, keyUp, player, metrics, liveAnalysis, nextTetromino, dropTime, isPlaying, mechanicMessage, isAnalyzing };
};
