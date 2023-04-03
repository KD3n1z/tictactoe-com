import Head from 'next/head'
import { useRef, useState } from 'react'
import Gameboard from '@/components/Gameboard';
import { GameState, Move, MoveAndRating, MoveRating } from '@/components/Types';
import Loader from '@/components/Loader';

type MoveScore = {
    move: Move,
    score: number
}

type GameWinState = "o" | "x" | "-" | "xo" | "init";

type EngineState = "idle" | "analyzing" | "thinking";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const engineLevel = 999;

export default function Home() {
    const gameState = useRef<GameState>([
        ["-", "-", "-"],
        ["-", "-", "-"],
        ["-", "-", "-"]
    ]);
    const [renderGameState, setGameState] = useState<GameState>(cloneGameState(gameState.current));
    const [lastMoveRating, setLastMoveRating] = useState<MoveAndRating | null>(null);
    const [engineState, setEngineState] = useState<EngineState>("idle");
    const [gameWinState, setGameWinState] = useState<GameWinState>("init");
    const gameBlocked = useRef<boolean>(false);

    function makeMove(move: Move) {
        if (!gameBlocked.current) {
            setGameWinState("-");

            if (gameState.current[move.row][move.column] != "-") {
                return;
            }

            let stateBeforeMove = cloneGameState(gameState.current);

            gameState.current[move.row][move.column] = "x";

            let won = checkWon(gameState.current);

            setGameState(cloneGameState(gameState.current));

            gameBlocked.current = true;
            analyzeAndMark(stateBeforeMove, move).then(() => {
                if (won == "-") {
                    if (getPossibleMoves(gameState.current).length > 0) {
                        engineMakeMove().then(() => {
                            if(checkWon(gameState.current) == "o") {
                                setGameWinState("o");
                                gameBlocked.current = true;
                            }else if(getPossibleMoves(gameState.current).length <= 0){
                                setGameWinState("xo");
                                gameBlocked.current = true;
                            }
                        });
                    } else {
                        setGameWinState("xo");
                        gameBlocked.current = true;
                    }
                } else {
                    setGameWinState(won);
                    gameBlocked.current = true;
                }
            });
        }
    }

    function cloneGameState(state: GameState): GameState {
        let cloned: GameState = [];

        state.forEach((el) => {
            cloned.push([...el]);
        })

        return cloned;
    }

    async function engineMakeMove() {
        setEngineState("thinking");

        await sleep(500);

        let scores: MoveScore[] = [];

        for (const move of getPossibleMoves(gameState.current)) {
            let cBoard = cloneGameState(gameState.current);
            cBoard[move.row][move.column] = "o";

            scores.push({
                move: move,
                score: getMoveScore(cBoard, true, engineLevel)
            });
        }

        let move = scores.sort((a, b) => a.score - b.score)[0].move;

        gameState.current[move.row][move.column] = "o";

        gameBlocked.current = false;
        setEngineState("idle");
        setGameState(cloneGameState(gameState.current));
    }

    async function analyzeAndMark(board: GameState, move: Move) {
        let rating = await analyze(board, move);

        setLastMoveRating({
            move: move,
            rating: rating
        });

        setEngineState("idle");
    }

    async function analyze(board: GameState, move: Move): Promise<MoveRating> {
        setEngineState("analyzing");
        await sleep(100);

        let possibleMoves = getPossibleMoves(board);

        if (possibleMoves.length >= 9) {
            return "book";
        }

        let scores: MoveScore[] = [];

        for (const move of possibleMoves) {
            let cBoard = cloneGameState(board);
            cBoard[move.row][move.column] = "x";

            scores.push({
                move: move,
                score: getMoveScore(cBoard, false)
            });
        }

        let cMove = scores.filter(e => e.move.row == move.row && e.move.column == move.column)[0].score;
        scores = scores.sort((a, b) => b.score - a.score);
        let bestMove = scores[0].score;

        console.log({ cMove, bestMove, scores });

        if (cMove >= 1) {
            return "great";
        }
        if (bestMove >= 0) {
            if (cMove >= bestMove) {
                if(scores.length > 1 && scores[1].score <= -0.5) {
                    return "compelled";
                }
                return "best";
            }
            if (cMove <= -0.5) {
                return "blunder";
            }
            if (cMove < 0) {
                return "mistake";
            }
            return "missed-win";
        } else {
            if (cMove >= bestMove) {
                if(scores.length > 1 && scores[1].score <= -0.5) {
                    return "compelled";
                }
                return "best";
            }
            if (cMove <= -0.5) {
                return "blunder";
            }
        }

        return "engine-error";
    }

    function getMoveScore(board: GameState, maximizing: boolean, maxDepth = 999, depth: number = 0): number {
        let wonState = checkWon(board);

        if (wonState == "x") {
            return 1 / (depth + 1);
        } else if (wonState == "o") {
            return -1 / (depth + 1);
        }

        if (depth > maxDepth) {
            return 0;
        }

        let score = maximizing ? -2 : 2;

        for (const move of getPossibleMoves(board)) {
            let cBoard = cloneGameState(board);
            cBoard[move.row][move.column] = maximizing ? "x" : "o";

            let cScore = getMoveScore(cBoard, !maximizing, maxDepth, depth + 1);

            score = maximizing ? Math.max(cScore, score) : Math.min(cScore, score);
        }

        if (score == -2 || score == 2) {
            return 0;
        }

        return score;
    }

    function checkWon(board: GameState): "x" | "-" | "o" {
        for (const [rowindex, row] of board.entries()) {
            if (row[0] != "-" && row[0] == row[1] && row[1] == row[2]) {
                return row[0];
            }
        }

        for (const [columnindex, cell] of board[0].entries()) {
            if (board[0][columnindex] != "-" && board[0][columnindex] == board[1][columnindex] && board[1][columnindex] == board[2][columnindex]) {
                return board[0][columnindex];
            }
        }

        if (board[0][0] != "-" && board[0][0] == board[1][1] && board[1][1] == board[2][2]) {
            return board[0][0];
        }

        if (board[0][2] != "-" && board[0][2] == board[1][1] && board[1][1] == board[2][0]) {
            return board[0][2];
        }

        return "-";
    }

    function getPossibleMoves(board: GameState): Move[] {
        let result: Move[] = [];

        for (const [rowindex, row] of board.entries()) {
            for (const [columnindex, cell] of row.entries()) {
                if (cell == "-") {
                    result.push({ row: rowindex, column: columnindex });
                }
            }
        }

        return result;
    }

    return (
        <>
            <Head>
                <title>tictactoe-com</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className="main">
                <div className='centered'>
                    <Gameboard gameBusy={engineState != "idle"} gameState={renderGameState} moveAndRating={lastMoveRating} makeMove={makeMove} />
                    <div className='sidemenu'>
                        <span className='status' onClick={() => {
                            engineMakeMove();
                        }}>
                            {
                                gameWinState != "-" ? 
                                <>
                                    {
                                        { 
                                            "x": "You won!", 
                                            "o": "You lost!",
                                            "xo": "Draw!",
                                            "init": "Welcome to tictactoe-com!"
                                        }[gameWinState]
                                    }
                                </> : (engineState != "idle" ? 
                                <>
                                    {
                                        { 
                                            "analyzing": "Analyzing...", 
                                            "thinking": "Thinking..." 
                                        }[engineState]
                                    }
                                    <Loader />
                                </> : "Your turn")
                            }
                        </span>
                    </div>
                </div>
            </main>
        </>
    )
}
