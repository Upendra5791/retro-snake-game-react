import React from 'react';
import {
    Actions,
    BoardCell,
    Cell,
    Direction,
    KeyboardCode,
    Position,
} from './app.model';
import { BoardService } from './board.service';
import { initialState, reducer } from './app-state';

export function Board() {
    const [boardCells, setBoard] = React.useState<BoardCell[]>([]);
    const [cells, setCells] = React.useState<Cell[]>([]);
    const [defaultTouch, setDefaultTouch] = React.useState({
        x: 0,
        y: 0,
        time: 0,
    });
    const [appState, dispatch] = React.useReducer(reducer, initialState);
    const boardService = new BoardService();
    let interval: any;

    const getHeadPosition = (): Position => {
        return cells[0].position;
    };
    const getHeadDirection = (): Direction => {
        return cells[0].direction;
    };
    const getTailCell = (): Cell => {
        return cells[cells.length - 1];
    };

    const createBoard = () => {
        const arr = [];
        for (let i = 1; i <= boardService.dim.height; i++) {
            for (let j = 1; j <= boardService.dim.width; j++) {
                arr.push({
                    id: Number(`${i}${j}`),
                    position: { x: i, y: j },
                    hasSnake: false,
                });
            }
        }
        setBoard(arr);
    };

    React.useEffect(() => {
        setBoard(
            boardCells.map((bc) => {
                return {
                    ...bc,
                    hasSnake: !!cells.find(
                        (f) =>
                            f.position.x === bc.position.x && f.position.y === bc.position.y
                    ),
                };
            })
        );
    }, [cells]);

    React.useEffect(() => {
        setBoard(
            boardCells.map((bc) => {
                return {
                    ...bc,
                    hasMeal:
                        bc.position.x === appState.meal?.position.x &&
                        bc.position.y === appState.meal?.position.y,
                };
            })
        );
    }, [appState.meal]);

    React.useEffect(() => {
        createBoard();
    }, []);

    const createSnake = () => {
        const _cells = new Array(boardService.initialSnakeLength)
            .fill(0)
            .map((m, i) => {
                return {
                    id: Number((Math.random() * 10).toFixed(3)),
                    direction: boardService.initialDirection,
                    position: { x: 0, y: 0 },
                };
            });
        _cells.reverse();
        const boardCellsTemp = boardCells.map((c, i) => {
            if (!!_cells[i]) {
                _cells[i].position = c.position;
                c.hasSnake = !!_cells.find((f) => f.position === c.position);
            }
            return c;
        });
        setBoard(boardCellsTemp);
        _cells.reverse();
        setCells(_cells);
    };

    const getCellClassNames = (cell: BoardCell) => {
        const classes = ['board-cell'];
        if (cell.hasSnake) classes.push('hasSnake');
        if (cell.hasMeal) classes.push('isMeal');
        if (
            appState.breakpoints.find(
                (f) =>
                    f.position.x === cell.position.x && f.position.y === cell.position.y
            )
        )
            classes.push('isBreakpoint');
        return classes.join(' ');
    };

    const getscreenClassNames = () => {
        const classes = ['screen'];
        if (!appState.game) classes.push('show');
        return classes.join(' ');
    };

    const start = () => {
        resetGame();
        createSnake();
        getMeal();
        dispatch({
            type: Actions.UPDATEGAME,
            payload: true,
        });
    };

    const addCell = () => {
        const cell_temp = [...cells];
        cell_temp.push({
            id: Number((Math.random() * 10).toFixed(3)),
            direction: getTailCell().direction,
            position: boardService.getNewCellPosition(getTailCell()),
        });
        setCells(cell_temp);
    };

    const getNewCell = (): Cell => {
        return {
            id: Number((Math.random() * 10).toFixed(3)),
            direction: getTailCell().direction,
            position: boardService.getNewCellPosition(getTailCell()),
        };
    };

    const updateHitCount = () => {
        if (!appState.breakpoints.length) return;
        let temp_breakpoints = [...appState.breakpoints];
        temp_breakpoints = temp_breakpoints.map((b) => {
            return {
                ...b,
                hitCount: cells.find(
                    (c) => b.position.x === c.position.x && b.position.y === c.position.y
                )
                    ? b.hitCount + 1
                    : b.hitCount,
            };
        });
        const completedBreakpoints = temp_breakpoints.filter(
            (f) => f.hitCount === cells.length
        );
        completedBreakpoints.forEach((cb) => {
            temp_breakpoints = temp_breakpoints.filter((f) => f != cb);
        });
        dispatch({
            type: Actions.UPDATEBREAKPOINT,
            payload: temp_breakpoints,
        });
    };

    const checkForDirectionChange = () => {
        updateHitCount();
        const tempCells = [...cells];
        tempCells.forEach((tc) => {
            const breakpointCell = appState.breakpoints.find(
                (bc) =>
                    bc.position.x === tc.position.x && bc.position.y === tc.position.y
            );
            if (!!breakpointCell) tc.direction = breakpointCell.direction;
        });
        setCells(tempCells);
    };

    const isSelfHit = (pos: Position): boolean => {
        return !!cells.find(
            (f) => f.position.x === pos.x && f.position.y === pos.y
        );
    };

    const mealEaten = (pos: Position): boolean => {
        const mealPos = boardCells.find((f) => f.hasMeal)?.position;
        return mealPos ? mealPos.x === pos.x && mealPos.y === pos.y : false;
    };

    const getMeal = (): void => {
        dispatch({
            type: Actions.UPDATEMEAL,
            payload: boardService.getNewMealPosition(boardCells),
        });
    };

    const progressGame = (): void => {
        checkForDirectionChange();
        const nextCellPos = boardService.getNextCellPosition(cells[0]);
        let newCellArray: Cell[] = [];
        setCells(
            [...cells].map((cell) => {
                return {
                    ...cell,
                    position: boardService.getNextCellPosition(cell),
                };
            })
        );
        if (isSelfHit(nextCellPos)) {
            alert('Game Over!');
            dispatch({
                type: Actions.UPDATEGAME,
                payload: false,
            });
            clearInterval(interval);
            return;
        }
        if (mealEaten(nextCellPos)) {
            newCellArray.push(getNewCell());
            setCells(
                [...cells, ...newCellArray].map((cell) => {
                    return {
                        ...cell,
                        position: boardService.getNextCellPosition(cell),
                    };
                })
            );
            dispatch({
                type: Actions.UPDATEMEAL,
                payload: null,
            });
            getMeal();
            increaseScore();
        }

    };

    const increaseScore = () => {
        dispatch({
            type: Actions.UPDATESCORE,
            payload: appState.score + 5,
        });
    };

    const resetGame = (): void => {
        setBoard([]);
        setCells([]);
        dispatch({
            type: Actions.UPDATEGAME,
            payload: false,
        });
        dispatch({
            type: Actions.UPDATESCORE,
            payload: 0,
        });
        dispatch({
            type: Actions.UPDATEBREAKPOINT,
            payload: [],
        });
    };

    const handleUserInputEvent = (key: KeyboardCode): void => {
        console.log(boardCells);
        switch (key) {
            case KeyboardCode.LEFT:
            case KeyboardCode.RIGHT:
            case KeyboardCode.UP:
            case KeyboardCode.DOWN:
                if (boardService.allowDirectionChange(key, getHeadDirection())) {
                    dispatch({
                        type: Actions.UPDATEBREAKPOINT,
                        payload: [
                            ...appState.breakpoints,
                            {
                                direction: boardService.getDirectionFromKeyCode(
                                    key as KeyboardCode
                                ),
                                hitCount: 0,
                                position: getHeadPosition(),
                            },
                        ],
                    });
                }
                break;
            case KeyboardCode.SPACE:
                progressGame();
        }
    };

    const handleKeyboardEvent = (e: KeyboardEvent) => {
        handleUserInputEvent(e.key as KeyboardCode);
    };

    const handleTouchEvent = (e: TouchEvent) => {
        const swipeDirection = getSwipeDirection(e);
        if (!!swipeDirection) handleUserInputEvent(swipeDirection as KeyboardCode);
    };

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyboardEvent);
        window.addEventListener('touchstart', handleTouchEvent);
        window.addEventListener('touchend', handleTouchEvent);
        window.addEventListener('touchcancel', handleTouchEvent);
        interval = setInterval(() => {
            if (appState.game) progressGame();
        }, 300);
        return () => {
            window.removeEventListener('keydown', handleKeyboardEvent);
            window.removeEventListener('touchstart', handleTouchEvent);
            window.removeEventListener('touchend', handleTouchEvent);
            window.removeEventListener('touchcancel', handleTouchEvent);
            clearInterval(interval);
        };
    });

    const getSwipeDirection = (event: TouchEvent): KeyboardCode | null => {
        let touch = event.touches[0] || event.changedTouches[0];

        // check the events
        if (event.type === 'touchstart') {
            let defaultTouch_temp = { x: 0, y: 0, time: 0 };
            defaultTouch_temp.x = touch.pageX;
            defaultTouch_temp.y = touch.pageY;
            defaultTouch_temp.time = event.timeStamp;
            setDefaultTouch(defaultTouch_temp);
        } else if (event.type === 'touchend') {
            let deltaX = touch.pageX - defaultTouch.x;
            let deltaY = touch.pageY - defaultTouch.y;
            let deltaTime = event.timeStamp - defaultTouch.time;

            if (deltaTime < 500) {
                if (Math.abs(deltaX) > 60) {
                    if (deltaX > 0) {
                        return KeyboardCode.RIGHT;
                    } else {
                        return KeyboardCode.LEFT;
                    }
                }

                if (Math.abs(deltaY) > 60) {
                    if (deltaY > 0) {
                        return KeyboardCode.DOWN;
                    } else {
                        return KeyboardCode.UP;
                    }
                }
            }
        }
        return null;
    };

    return (
        <React.Fragment>
            <div className="container">
                <div className="header">
                    <div className="heading">
                        <h1>Retro Snake Game</h1>
                    </div>
                    <div className="score">
                        <span>Score</span>
                        <span> {appState.score}</span>
                    </div>
                </div>
                <div className="board-container">
                    <div className="board">
                        {boardCells.map((cell) => {
                            return (
                                <span
                                    key={cell.position.x + '_' + cell.position.y}
                                    id={cell.position.x + '_' + cell.position.y}
                                    className={getCellClassNames(cell)}
                                ></span>
                            );
                        })}

                        <div className={getscreenClassNames()}>
                            <div className="btn-container">
                                <p>Swipe to change direction</p>
                                <button disabled={appState.game}
                                    onClick={start}>Start</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* <button onClick={start}>Start</button>
      <button onClick={addCell}>Add Cell</button> */}
        </React.Fragment>
    );
}
