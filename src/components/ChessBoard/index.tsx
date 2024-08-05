import { useState, useCallback, MouseEvent, useEffect } from 'react';
import { ChessBoard as ChessBoardClass } from '@/models/ChessBoard';
import './index.css';
import { chessBoardType, colorType, pieceNamesType } from '@/models/types';
import BlackBishop from '@/assets/svg/black_bishop.svg';
import BlackRook from '@/assets/svg/black_rook.svg';
import BlackKnight from '@/assets/svg/black_knight.svg';
import BlackQueen from '@/assets/svg/black_queen.svg';
import WhiteBishop from '@/assets/svg/white_bishop.svg';
import WhiteRook from '@/assets/svg/white_rook.svg';
import WhiteKnight from '@/assets/svg/white_knight.svg';
import WhiteQueen from '@/assets/svg/white_queen.svg';
import Draggable from 'react-draggable';
import { socket } from '@/socket-client/socket';
import { useParams } from 'react-router-dom';
import { increaseWinCounter } from '@/api';
import { toast } from 'react-toastify';

interface IControlledPosition {
    x: number;
    y: number;
}

interface IChessBoardComponent {
    chessPieceSide: colorType,
    chessBoardInstance: ChessBoardClass,
    playerIsOnline: boolean,
    playerAdversaryId: string,
}

interface Payload {
    selectedLine: number,
    selectedColumn: number,
    targetLine: number,
    targetColumn: number,
    chessRoomId: string,
    userId: string,
}

function ChessBoard({ chessPieceSide, chessBoardInstance, playerIsOnline, playerAdversaryId }: IChessBoardComponent) {
    const {
        chessBoard,
        turnOfPlay,
        blackPlayerOnCheck,
        whitePlayerOnCheck,
        checkMate,
        deadPieces,
    } = chessBoardInstance;
    const cPosition = new Array(8).fill([]).map(() => new Array(8).fill({ x: 0, y: 0 }));

    const [, updateState] = useState();
    const [constrolledPosition] = useState<IControlledPosition[][]>(cPosition as IControlledPosition[][]);
    const forceUpdate = useCallback(() => updateState({} as undefined), []);
    const { roomId } = useParams();
    const [timeCounter, setTimeCounter] = useState(20);

    const movePieceOfAdversary = ({
        selectedLine, selectedColumn, targetLine, targetColumn, chessRoomId,
    }: Payload): void => {
        if (chessPieceSide !== turnOfPlay && chessRoomId === roomId) {
            chessBoardInstance.selectPiece(selectedLine, selectedColumn);
            chessBoardInstance.movePiece(targetLine, targetColumn);
            forceUpdate();
        }
    };
    useEffect(() => {
        chessBoardInstance.playerSide = chessPieceSide;
        socket.on('movePiece', (payload: Payload) => {
            movePieceOfAdversary(payload);
        });

        return () => {
            socket.off('movePiece');
        };
    }, [turnOfPlay, chessPieceSide, forceUpdate, roomId]);

    useEffect(() => {
        if (!playerIsOnline) {
            setTimeout(() => {
                if (timeCounter - 1 >= 0) {
                    setTimeCounter(timeCounter - 1);
                } else {
                    toast.success('You won the match!');
                    increaseWinCounter();
                    socket.emit('player-gave-up', { userId: playerAdversaryId });
                    socket.emit('update-room', { roomId });
                }
            }, 1000);
        } else {
            setTimeCounter(20);
        }
    }, [playerIsOnline, timeCounter]);

    const clickOnCellHandler = (targetLine: number, targetColumn: number) => {
        if (!checkMate && chessPieceSide === turnOfPlay) {
            if (chessBoardInstance.mode === 'selectPiece') {
                chessBoardInstance.selectPiece(targetLine, targetColumn);
            } else if (chessBoardInstance.mode === 'movePiece' && chessBoard[targetLine][targetColumn].isPossibleToMove) {
                chessBoardInstance.movePiece(targetLine, targetColumn);
                const message: Payload = {
                    selectedLine: chessBoardInstance.previousLine,
                    selectedColumn: chessBoardInstance.previousColumn,
                    targetColumn: targetColumn,
                    targetLine: targetLine,
                    chessRoomId: roomId,
                    userId: localStorage.getItem('@UserId'),
                };
                socket.emit('movePiece', message);
            } else if (chessBoardInstance.mode === 'movePiece' && chessBoard[targetLine][targetColumn].currentPiece?.color === turnOfPlay) {
                chessBoardInstance.selectPiece(targetLine, targetColumn);
            } else {
                chessBoardInstance.changeModeToSelectMode();
            }
            forceUpdate();
        }
    };

    // const restartGameHandler = () => {
    //     chessBoardInstance.startGame();
    //     forceUpdate();
    // };

    const pieceSelectionHandler = (pieceName: pieceNamesType) => {
        chessBoardInstance.setSelectedPieceInPawnPlace(pieceName);
        forceUpdate();
    };

    const onDragStopHandler = (e: MouseEvent<HTMLElement>, l: number, c: number) => {
        const element = e.target as HTMLInputElement;
        element.style.zIndex = '10';
        const squareSize = document.querySelector('.square').clientWidth;
        const transform = element.style.transform;

        if (transform) {
            const [deltaC, deltaL] = element.style.transform.split('(')[1].replace(')', '').split(',').map(n => Math.round(Number(n.slice(0, -2)) / squareSize));
            const newL = chessPieceSide === 'white' ? l + deltaL : l - deltaL;
            const newC = chessPieceSide === 'white' ? c + deltaC : c - deltaC;
            if ((newL >= 0 && newL <= 7) && (newC >= 0 && newC <= 7)) {
                clickOnCellHandler(newL, newC);
            }
        }
    };

    const onDragStartHandler = (e: MouseEvent<HTMLElement>, l: number, c: number) => {
        clickOnCellHandler(l, c);
        const element = e.target as HTMLInputElement;
        element.style.zIndex = '20';
    };

    const ChessBoardComponent = chessPieceSide === 'white' ? chessBoard : chessBoard.map(line => line.slice(0).reverse()).slice(0).reverse();

    return (
        <div className='chess-board-component centralize'>
            <div className='dead-pieces'>
                <div>
                    {deadPieces.filter(p => p.color === 'black').map((p, i) => <img src={p.piece.svgFile} alt={p.piece.name} key={p.color + i} />)}
                </div>
                <div>
                    {deadPieces.filter(p => p.color === 'white').map((p, i) => <img src={p.piece.svgFile} alt={p.piece.name} key={p.color + i} />)}
                </div>
            </div>
            <div className='board relative'>
                {ChessBoardComponent.map((line: chessBoardType[]) => (
                    line.map((square: chessBoardType) => (
                        <div
                            key={'square:' + square.line + square.column}
                            className='square centralize'
                            onClick={() => clickOnCellHandler(square.line, square.column)}
                            style={{ backgroundColor: square.squareColor }}
                        >
                            {square.currentPiece && (
                                (
                                    <Draggable
                                        disabled={(turnOfPlay !== square.currentPiece.color || chessPieceSide !== turnOfPlay) || checkMate}
                                        position={constrolledPosition[square.line][square.column]}
                                        onStart={(e: MouseEvent<HTMLElement>) => onDragStartHandler(e, square.line, square.column)}
                                        onStop={(e: MouseEvent<HTMLElement>) => onDragStopHandler(e, square.line, square.column)}
                                    >
                                        <img
                                            draggable={false}
                                            className={square.currentPiece.color === chessBoardInstance.turnOfPlay && !checkMate && chessPieceSide === turnOfPlay ? 'possible-to-click' : ''}
                                            src={square.currentPiece.piece.svgFile}
                                        />
                                    </Draggable>
                                )
                            )}
                            {(
                                square.currentPiece &&
                                square.currentPiece.piece.kingPiece &&
                                (
                                    (square.currentPiece.color === 'black' && blackPlayerOnCheck) ||
                                    (square.currentPiece.color === 'white' && whitePlayerOnCheck)
                                )
                            ) && (
                                <div className='square-over square-check-mark'></div>
                            )}
                            {square.isPossibleToMove && <div className='square-over square-possible-move'></div>}
                            {square.isSelected && <div className='square-over square-selected'></div>}
                            {square.isPreviousSelectedSquareMove && <div className='square-over square-previous-move'></div>}
                            {square.isPreviousTargetSquareMove && <div className='square-over square-previous-move'></div>}
                        </div>
                    )
                    )
                ))}
                {!playerIsOnline && (
                    <div className='absolute w-full h-full top-0 left-0 flex justify-center items-center z-10 bg-stone-950/[.5]'>
                    Player is offline... {timeCounter}s
                    </div>
                )}
            </div>
            <div className='info-block'>
                <div className='turn-indicator centralize'>
                    <svg height='28' width='28'>
                        <circle cx='14' cy='14' r='12' stroke='#0e857b' strokeWidth='2' fill={turnOfPlay} />
                    </svg>
                    <h3>
                        Vez das peças {turnOfPlay === 'white' ? 'brancas' : 'pretas'}
                    </h3>
                </div>
                {(!checkMate && blackPlayerOnCheck) && <p>Peças pretas estão em check!</p>}
                {(!checkMate && whitePlayerOnCheck) && <p>Peças brancas estão em check!</p>}
                {(checkMate && turnOfPlay === 'white') && <p>Peças pretas ganharam!</p>}
                {(checkMate && turnOfPlay === 'black') && <p>Peças brancas ganharam!</p>}
                {/* {!chessPieceSide && <button onClick={restartGameHandler}>Restart Game</button>} */}
            </div>
            {chessBoardInstance.pawnReachedEndOfChessBoard && (
                <div className='select-piece'>
                    <h2>Select One Piece</h2>
                    {chessBoardInstance.turnOfPlay === 'white' ? (
                        <div className='black-pieces centralize'>
                            <img src={BlackBishop} onClick={() => pieceSelectionHandler('bishop')} alt='black bishop piece' />
                            <img src={BlackKnight} onClick={() => pieceSelectionHandler('knight')} alt='black knight piece' />
                            <img src={BlackQueen} onClick={() => pieceSelectionHandler('queen')} alt='black queen piece' />
                            <img src={BlackRook} onClick={() => pieceSelectionHandler('rook')} alt='black rook piece' />
                        </div>
                    ) : (
                        <div className='white-pieces centralize'>
                            <img src={WhiteBishop} onClick={() => pieceSelectionHandler('bishop')} alt='white bishop piece' />
                            <img src={WhiteKnight} onClick={() => pieceSelectionHandler('knight')} alt='white knight piece' />
                            <img src={WhiteQueen} onClick={() => pieceSelectionHandler('queen')} alt='white queen piece' />
                            <img src={WhiteRook} onClick={() => pieceSelectionHandler('rook')} alt='white rook piece' />
                        </div>
                    )}

                </div>
            )}
            <div className='playing-as centralize'>
                <img src={chessPieceSide === 'black' ? BlackKnight : WhiteKnight} alt='knight piece' />
                <span>Playing as {chessPieceSide}</span>
            </div>
        </div>
    );
}

export default ChessBoard;
