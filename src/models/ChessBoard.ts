import ChessPiece from './ChessPiece';
import ChessPiecePawn from './ChessPiecePawn';
import ChessPieceBishop from './ChessPieceBishop';
import ChessPieceKing from './ChessPieceKing';
import ChessPieceKnight from './ChessPieceKnight';
import ChessPieceRook from './ChessPieceRook';
import ChessPieceQueen from './ChessPieceQueen';
import PieceMoveSoundEffect from '../assets/sound/piece_move_sound.mp3';
import ChessCheckSoundEffect from '../assets/sound/check_sound.wav';
// import ChessCheckMateSoundEffect from '../assets/sound/check_mate_sound.wav';
import YouLoseSoundEffect from '@/assets/sound/you_lose.wav';
import YouWinSoundEffect from '@/assets/sound/victory.mp3';
import DrawSoundEffect from '@/assets/sound/draw.wav';
import { increaseDrawCounter, increaseLoseCounter, increaseWinCounter } from '@/api';
import { chessBoardArrayType, colorType, pieceNamesType } from './types';
import { toast } from 'react-toastify';
import { socket } from '@/socket-client/socket';
// import lodash from 'lodash';

export class ChessBoard {
    constructor(roomId: string, playerSide?: 'black' | 'white') {
        this.startGame();
        this.roomId = roomId;
        this.playerSide = playerSide;
    }
    public chessBoard: chessBoardArrayType;
    public turnOfPlay:'black'|'white' = 'white';
    public selectedPiece?: ChessPiece | null;
    public mode?: 'movePiece' | 'selectPiece';
    public previousLine: number;
    public previousColumn: number;
    public whitePlayerOnCheck: boolean = false;
    public blackPlayerOnCheck: boolean = false;
    public checkMate: boolean = false;
    public draw: boolean = false;
    public playerSide: 'black' | 'white' = null;
    public roomId: string = null;

    private whiteKingPiece: ChessPiece;
    private blackKingPiece: ChessPiece;

    public pawnReachedEndOfChessBoard: boolean = false;
    private pawnPositionLine: number;
    private pawnPositionColumn: number;

    public deadPieces: ChessPiece[] = [];

    private setPiecesInBoard() {
        new Array(8).fill(0).forEach((_, c:number) => {
            this.chessBoard[6][c].currentPiece = new ChessPiece(6, c, 'white', new ChessPiecePawn('white'));
            this.chessBoard[1][c].currentPiece = new ChessPiece(1, c, 'black', new ChessPiecePawn('black'));
        });
        this.whiteKingPiece = new ChessPiece(7, 4, 'white', new ChessPieceKing('white'));
        this.blackKingPiece = new ChessPiece(0, 4, 'black', new ChessPieceKing('black'));

        this.chessBoard[7][0].currentPiece = new ChessPiece(7, 0, 'white', new ChessPieceRook('white'));
        this.chessBoard[7][1].currentPiece = new ChessPiece(7, 1, 'white', new ChessPieceKnight('white'));
        this.chessBoard[7][2].currentPiece = new ChessPiece(7, 2, 'white', new ChessPieceBishop('white'));
        this.chessBoard[7][3].currentPiece = new ChessPiece(7, 3, 'white', new ChessPieceQueen('white'));
        this.chessBoard[7][4].currentPiece = this.whiteKingPiece;
        this.chessBoard[7][5].currentPiece = new ChessPiece(7, 5, 'white', new ChessPieceBishop('white'));
        this.chessBoard[7][6].currentPiece = new ChessPiece(7, 6, 'white', new ChessPieceKnight('white'));
        this.chessBoard[7][7].currentPiece = new ChessPiece(7, 7, 'white', new ChessPieceRook('white'));

        this.chessBoard[0][0].currentPiece = new ChessPiece(0, 0, 'black', new ChessPieceRook('black'));
        this.chessBoard[0][1].currentPiece = new ChessPiece(0, 1, 'black', new ChessPieceKnight('black'));
        this.chessBoard[0][2].currentPiece = new ChessPiece(0, 2, 'black', new ChessPieceBishop('black'));
        this.chessBoard[0][3].currentPiece = new ChessPiece(0, 3, 'black', new ChessPieceQueen('black'));
        this.chessBoard[0][4].currentPiece = this.blackKingPiece;
        this.chessBoard[0][5].currentPiece = new ChessPiece(0, 5, 'black', new ChessPieceBishop('black'));
        this.chessBoard[0][6].currentPiece = new ChessPiece(0, 6, 'black', new ChessPieceKnight('black'));
        this.chessBoard[0][7].currentPiece = new ChessPiece(0, 7, 'black', new ChessPieceRook('black'));
    }

    private seePossibleMoves(l: number, c: number) {
        if (this.chessBoard[l][c].currentPiece) {
            this.chessBoard[l][c].isSelected = true;
            this.chessBoard = this.filterMovesThatWouldResultInCheck(
                l,
                c,
                this.chessBoard[l][c].currentPiece?.piece.setPossibleMoves(
                    this.chessBoard,
                    l,
                    c,
                    this.playerSide === 'white' ? this.whitePlayerOnCheck : this.blackPlayerOnCheck,
                ),
            );
        }
    }

    public filterMovesThatWouldResultInCheck(
        previousLine: number,
        previousColumn: number,
        chessBoardWithPossibleMoves: chessBoardArrayType
    ): chessBoardArrayType {
        return chessBoardWithPossibleMoves.map((line, targetLine) => line.map((square, targetColumn) => {
            if (square.isPossibleToMove) {
                return {
                    ...square,
                    isPossibleToMove: !this.verifyIfNextMoveWillBeCheck(
                        this.turnOfPlay,
                        targetLine,
                        targetColumn,
                        previousLine,
                        previousColumn,
                    ),
                };
            }
            return square;
        }));
    }

    private setPieceToSquare(currentPiece: ChessPiece, targetLine: number, targetColumn: number) {
        const rockMove = !this.selectedPiece.piece.pieceHasAlreadyMove && this.selectedPiece.piece.kingPiece && (targetColumn === 6 || targetColumn === 2);
        currentPiece.piece.pieceHasAlreadyMove = true;
        currentPiece?.setChessPiece(this.chessBoard, targetLine, targetColumn);
        if (rockMove) {
            const rookPreviousColumn = targetColumn === 6 ? 7 : 0;
            const rookTargetColumn = targetColumn === 6 ? 5 : 3;
            const rookPiece = this.chessBoard[targetLine][rookPreviousColumn].currentPiece;
            rookPiece.piece.pieceHasAlreadyMove = true;
            rookPiece?.setChessPiece(this.chessBoard, targetLine, rookTargetColumn);
        }
    }

    public movePiece(targetLine: number, targetColumn: number) {
        if (this.selectedPiece && this.chessBoard[targetLine][targetColumn].isPossibleToMove) {
            if (this.chessBoard[targetLine][targetColumn].currentPiece) {
                this.deadPieces.push(this.chessBoard[targetLine][targetColumn].currentPiece);
            }
            const currentPiece = this.chessBoard[this.previousLine][this.previousColumn].currentPiece;
            this.setPieceToSquare(currentPiece, targetLine, targetColumn);

            if (
                currentPiece.piece.name === 'pawn' &&
                !this.checkMate &&
                this.roomId === 'bot' &&
                this.turnOfPlay !== this.playerSide &&
                (
                    (currentPiece.color === 'white' && currentPiece.l === 0) ||
                    (currentPiece.color === 'black' && currentPiece.l === 7)
                )
            ) {
                this.chessBoard[targetLine][targetColumn].currentPiece = new ChessPiece(targetLine, targetColumn, currentPiece.color, new ChessPieceQueen(currentPiece.color));
            }

            this.changeModeToSelectMode();

            this.checkVerification(this.turnOfPlay);
            
            this.turnOfPlay = this.turnOfPlay === 'white' ? 'black' : 'white';

            this.checkIfPawnReachedEndOfChessBoard(currentPiece, targetLine, targetColumn);

            this.setMarkToPreviousSquareMove(targetLine, targetColumn);
        }
        return true;
    }

    public botMove() {
        const now = Date.now();
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.selectPiece(bestMove.from.line, bestMove.from.column);
            this.movePiece(bestMove.to.line, bestMove.to.column);
            const after = Date.now();
            console.log('time spent', (after - now)/(1000) + 's' );
        }

    }
    

    public minimaxAlgorithm(
        chessBoard: chessBoardArrayType,
        depth: number,
        isMaximizingPlayer: boolean,
        alpha: number,
        beta: number,
        hasCheck: boolean = false
    ): number {
        if (depth === 0 || this.checkMate || this.draw) {
            return this.evaluateBoard(chessBoard, isMaximizingPlayer);
        }
    
        const playerSide = this.playerSide;
        const adversarySide = this.playerSide === 'white' ? 'black' : 'white';
        if (this.verifyIfPlayerIsOnCheck(isMaximizingPlayer ? playerSide : adversarySide, chessBoard)) {
            hasCheck = true;
            if (this.verifySimulationBoardCheckMate(isMaximizingPlayer ? playerSide : adversarySide, chessBoard)) {
                return isMaximizingPlayer ? -100000 * depth : 100000 * depth;
            }
        }

        const moves = this.getAllPossibleMoves(chessBoard, isMaximizingPlayer ? this.turnOfPlay : this.turnOfPlay === 'white' ? 'black' : 'white', hasCheck);

        if (isMaximizingPlayer) { // Adversary
            let maxEval = -Infinity;
            for (const move of moves) {
                const newChessBoard = this.cloneChessBoard(chessBoard);
                this.makeMove(newChessBoard, move);
    
                const evaluation = this.minimaxAlgorithm(newChessBoard, depth - 1, false, alpha, beta, hasCheck);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
    
                if (beta <= alpha) {
                    break; // Poda alfa-beta
                }
            }
            return maxEval;
        } else { // PlayerSide
            let minEval = Infinity;
            for (const move of moves) {
                const newChessBoard = this.cloneChessBoard(chessBoard);
                this.makeMove(newChessBoard, move);
    
                const evaluation = this.minimaxAlgorithm(newChessBoard, depth - 1, true, alpha, beta, hasCheck);
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
    
                if (beta <= alpha) {
                    break; // Poda alfa-beta
                }
            }
            return minEval;
        }
    }

    public verifySimulationBoardIfNextMoveWillBeCheck(
        colorOfPlayerBeeingAttacked: 'white' | 'black',
        targetLine: number,
        targetColumn: number,
        previousLine: number,
        previousColumn: number,
        chessBoard: chessBoardArrayType,
    ): boolean {
        const cloneChessBoard = this.cloneChessBoard(chessBoard);

        const selectedPiece = cloneChessBoard[previousLine][previousColumn].currentPiece;
        selectedPiece?.setChessPiece(cloneChessBoard, targetLine, targetColumn);

        let check = false;
        const colorOfAttacker = colorOfPlayerBeeingAttacked === 'white' ? 'black' : 'white';

        if(this.verifyIfPlayerIsOnCheck(colorOfAttacker, cloneChessBoard)) {
            check = true;
        }
        return check;
    }

    public verifySimulationBoardCheckMate (colorOfplayerBeingAttacked: 'white' | 'black', chessBoard: chessBoardArrayType): boolean {
        const possibleResults: boolean[] = [];
        const board = new Array(8).fill(0).map(() => new Array(8).fill(0));
        const pieces: ChessPiece[] = [];

        board.map((line, previousLine: number) => line.map((_, previousColumn: number) => {
            const selectedPiece = this.chessBoard[previousLine][previousColumn].currentPiece;

            if (selectedPiece && selectedPiece.piece.color === colorOfplayerBeingAttacked){
                    
                const possibleMovesOfAttackedPlayer = selectedPiece.piece.checkPossibleMoves(this.chessBoard, previousLine, previousColumn);
                    
                pieces.push(selectedPiece);

                possibleMovesOfAttackedPlayer.map((lineX, targetLine) => lineX.map((isPossibleToMove, targetColumn)=> {
                    if(isPossibleToMove && selectedPiece) {
                        const result = this.verifySimulationBoardIfNextMoveWillBeCheck(
                            colorOfplayerBeingAttacked,
                            targetLine,
                            targetColumn,
                            previousLine,
                            previousColumn,
                            chessBoard
                        );
                        possibleResults.push(result);
                    }
                }));

            }
        }) 
        );
        const checkMate = possibleResults.every(r => r);

        return checkMate;
    }
    
    public findBestMove(): { from: { line: number, column: number }, to: { line: number, column: number } } | null {
        let bestMove = null;
        let bestValue = -Infinity;

        const playerOnCheck = this.verifyIfPlayerIsOnCheck(this.turnOfPlay, this.chessBoard);

        const moves = this.getAllPossibleMoves(this.chessBoard, this.turnOfPlay, playerOnCheck)
            .filter((move: { from: { line: number, column: number }, to: { line: number, column: number } }) => {
                return !this.verifyIfNextMoveWillBeCheck(
                    this.turnOfPlay,
                    move.to.line,
                    move.to.column,
                    move.from.line,
                    move.from.column
                );
            });
    
        if (moves.length === 0) {
            console.log('moves', moves);
            return null;
        }
    
        for (const move of moves) {
            const newChessBoard = this.cloneChessBoard(this.chessBoard);
            this.makeMove(newChessBoard, move);
    
            const moveValue = this.minimaxAlgorithm(newChessBoard, 3, false, -Infinity, Infinity); // Profundidade 3
    
            if (moveValue > bestValue) {
                bestValue = moveValue;
                bestMove = move;
            }
        }
    
        // if (!bestMove) {
        //     console.log('bestMove', bestMove);
        //     bestMove = moves[Math.floor(Math.random() * moves.length)];
        // }
    
        return bestMove;
    }
    
    public getAllPossibleMoves(
        chessBoard: chessBoardArrayType,
        color: 'white' | 'black',
        playerOnCheck: boolean = false,
    ): { from: { line: number, column: number }, to: { line: number, column: number } }[] {
        const moves: { from: { line: number, column: number }, to: { line: number, column: number } }[] = [];
    
        chessBoard.forEach((line, l) => line.forEach((square, c) => {
            if (square.currentPiece && square.currentPiece.color === color) {
                const possibleMoves = square.currentPiece.piece.checkPossibleMoves(chessBoard, l, c, playerOnCheck);
    
                possibleMoves.forEach((moveLine, targetLine) => moveLine.forEach((isPossible, targetColumn) => {
                    if (isPossible) {
                        moves.push({
                            from: { line: l, column: c },
                            to: { line: targetLine, column: targetColumn },
                        });
                    }
                }));
            }
        }));
    
        // Ordena os movimentos por heurística (capturas primeiro)
        moves.sort((a, b) => {
            const pieceA = chessBoard[a.to.line][a.to.column].currentPiece;
            const pieceB = chessBoard[b.to.line][b.to.column].currentPiece;
            const valueA = pieceA ? this.getPieceValue(pieceA.piece) : 0;
            const valueB = pieceB ? this.getPieceValue(pieceB.piece) : 0;
            return valueB - valueA; // Movimentos que capturam peças de maior valor primeiro
        });
    
        return moves;
    }

    public doesMoveResultInCheck(
        fromLine: number,
        fromColumn: number,
        toLine: number,
        toColumn: number,
        color: 'white' | 'black',
        chessBoard: chessBoardArrayType
    ): boolean {
        const originalPiece = chessBoard[toLine][toColumn].currentPiece;
        const movingPiece = chessBoard[fromLine][fromColumn].currentPiece;
    
        chessBoard[toLine][toColumn].currentPiece = movingPiece;
        chessBoard[fromLine][fromColumn].currentPiece = null;
    
        const isCheck = this.verifyIfPlayerIsOnCheck(color, chessBoard);
    
        chessBoard[fromLine][fromColumn].currentPiece = movingPiece;
        chessBoard[toLine][toColumn].currentPiece = originalPiece;
    
        return isCheck;
    }

    public makeMove(chessBoard: chessBoardArrayType, move: { from: { line: number, column: number }, to: { line: number, column: number } }) {
        const { from, to } = move;
        let piece = chessBoard[from.line][from.column].currentPiece;
    
        if (!piece) {
            return;
        }
    
        chessBoard[to.line][to.column].currentPiece = piece;
        chessBoard[from.line][from.column].currentPiece = null;
        piece.l = to.line;
        piece.c = to.column;

        if (
            piece.piece.name === 'pawn' &&
            this.roomId === 'bot' &&
            (
                (piece.color === 'white' && piece.l === 0) ||
                (piece.color === 'black' && piece.l === 7)
            )
        ) {
            piece = new ChessPiece(to.line, to.column, piece.color, new ChessPieceQueen(piece.color));
            chessBoard[to.line][to.column].currentPiece = new ChessPiece(to.line, to.column, piece.color, new ChessPieceQueen(piece.color));
        }

    }
    
    public evaluateBoard(chessBoard: chessBoardArrayType, isMaximizingPlayer: boolean): number {
        let evaluation = 0;
    
        chessBoard.forEach((line, l) => line.forEach((square, c) => {
            if (square.currentPiece) {
                const piece = square.currentPiece.piece;
                const value = this.getPieceValue(piece) * 4;
                evaluation += square.currentPiece.color === this.turnOfPlay ? value : -value;
            }

            if (square?.currentPiece?.piece?.name === 'rook') {
                const isRookMoveUnnecessary = this.isRookMoveUnnecessary(chessBoard, l, c, square.currentPiece.color);
                if (isRookMoveUnnecessary) {
                    evaluation += square.currentPiece.color === this.turnOfPlay ? -20 : 20; // Penalização
                }
            }
        }));
    
        const centerSquares = [
            [3, 3], [3, 4], [4, 3], [4, 4], 
            [5, 5], [5, 4], [5, 3], [5, 2],
            [2, 5], [2, 4], [2, 3], [2, 2],
            [3, 5], [4, 5], [3, 2], [4, 2],
        ];
        centerSquares.forEach(([l, c]) => {
            const piece = chessBoard[l][c].currentPiece;
            if (piece) {
                evaluation += piece.color === this.turnOfPlay ? 10 : -10;
            }
        });

        const playerSide = this.playerSide;
        const adversarySide = this.playerSide === 'white' ? 'black' : 'white';
        if (this.verifyIfPlayerIsOnCheck(isMaximizingPlayer ? playerSide : adversarySide, chessBoard)) {
            evaluation += isMaximizingPlayer ? 10 : -10;
        }
    
        return evaluation;
    }
    
    public getPieceValue(piece: ChessPiecePawn | ChessPieceBishop | ChessPieceKing | ChessPieceKnight | ChessPieceRook | ChessPieceQueen): number {
        if (piece instanceof ChessPiecePawn) return 10;
        if (piece instanceof ChessPieceKnight) return 30;
        if (piece instanceof ChessPieceBishop) return 30;
        if (piece instanceof ChessPieceRook) return 50;
        if (piece instanceof ChessPieceQueen) return 90;
        if (piece instanceof ChessPieceKing) return 900;
        return 0;
    }

    public isRookMoveUnnecessary(chessBoard: chessBoardArrayType, l: number, c: number, color: 'white' | 'black'): boolean {
        // Verifica se a torre está capturando uma peça
        if (chessBoard[l][c].currentPiece && chessBoard[l][c].currentPiece.color !== color) {
            return false; // Movimento de captura não é desnecessário
        }
    
        const isImportantSquare = this.isImportantSquare(l, c);
        const isOpenFile = this.isOpenFile(chessBoard, c, color);
    
        if (isImportantSquare || isOpenFile) {
            return false; // Movimento para casa importante não é desnecessário
        }
    
        return true;
    }
    
    public isImportantSquare(l: number, c: number): boolean {
        const centerSquares = [
            [3, 3], [3, 4], [4, 3], [4, 4], 
            [5, 5], [5, 4], [5, 3], [5, 2],
            [2, 5], [2, 4], [2, 3], [2, 2],
            [3, 5], [4, 5], [3, 2], [4, 2],
        ];
        return centerSquares.some(([centerL, centerC]) => centerL === l && centerC === c);
    }
    
    public isOpenFile(chessBoard: chessBoardArrayType, column: number, color: 'white' | 'black'): boolean {
        for (let i = 0; i < 8; i++) {
            const piece = chessBoard[i][column].currentPiece;
            if (piece && piece.color === color && piece.piece instanceof ChessPiecePawn) {
                return false; // Há um peão da mesma cor na coluna
            }
        }
        return true; // Coluna aberta
    }

    public cloneChessBoard(chessBoard: chessBoardArrayType): chessBoardArrayType {
        return chessBoard.map((line) =>
            line.map((square) => ({
                ...square,
                currentPiece: square.currentPiece
                    ? new ChessPiece(
                        square.currentPiece.l,
                        square.currentPiece.c,
                        square.currentPiece.color,
                        square.currentPiece.piece
                    )
                    : null,
            }))
        );
    }

    private checkIfPawnReachedEndOfChessBoard (currentPiece: ChessPiece, targetLine: number, targetColumn: number) {
        if(currentPiece.piece.name === 'pawn' && !this.checkMate) {
            if (
                (currentPiece.color === 'white' && currentPiece.l === 0) ||
                (currentPiece.color === 'black' && currentPiece.l === 7)
            ) {
                this.pawnReachedEndOfChessBoard = true;
                this.pawnPositionLine = targetLine;
                this.pawnPositionColumn = targetColumn;
            }
        }
    }

    private setMarkToPreviousSquareMove (targetLine: number, targetColumn: number) {
        this.chessBoard = this.chessBoard.map(line => line.map(square => ({ ...square, isPreviousSelectedSquareMove: false, isPreviousTargetSquareMove: false })));
        this.chessBoard[this.previousLine][this.previousColumn].isPreviousSelectedSquareMove = true;
        this.chessBoard[targetLine][targetColumn].isPreviousTargetSquareMove = true;
    }

    public async checkVerification (turnOfPlay: 'white' | 'black') {
        const nextTurn = turnOfPlay === 'white' ? 'black' : 'white';
        const playerOnCheck = this.verifyIfPlayerIsOnCheck(turnOfPlay, this.chessBoard);
        this.blackPlayerOnCheck = playerOnCheck && nextTurn === 'black';
        this.whitePlayerOnCheck = playerOnCheck && nextTurn === 'white';
        this.selectedPiece = null;
        const nextMoveIsAlwaysCheck = this.verifyCheckMate(nextTurn);
        new Audio(PieceMoveSoundEffect).play();
        
        if (playerOnCheck && nextMoveIsAlwaysCheck) {
            const winner = nextTurn === 'white' ? 'black' : 'white';

            if (this.playerSide === winner) {
                new Audio(YouWinSoundEffect).play();
                await increaseWinCounter();
                toast.success('You Win!');
            }

            if (this.playerSide !== winner) {
                new Audio(YouLoseSoundEffect).play();
                await increaseLoseCounter();
                toast.error('You Lose!');
            }
                
            socket.emit('update-room', { roomId: this.roomId });
            this.checkMate = true;
            return;
        }

        if (nextMoveIsAlwaysCheck) {
            new Audio(DrawSoundEffect).play();
            await increaseDrawCounter();
            socket.emit('update-room', { roomId: this.roomId });
            
            toast.success('Its a draw');
            this.draw = true;
            return;
        }

        if (playerOnCheck) {
            new Audio(ChessCheckSoundEffect).play();
            return;
        }
    }

    public setSelectedPieceInPawnPlace (pieceName: pieceNamesType) {
        const currentPlayerColor = this.turnOfPlay === 'white' ? 'black' : 'white';
        const l = this.pawnPositionLine;
        const c = this.pawnPositionColumn;
        
        let chessPiece;
        if (pieceName === 'bishop') chessPiece = new ChessPieceBishop(currentPlayerColor);
        if (pieceName === 'rook') chessPiece = new ChessPieceRook(currentPlayerColor);
        if (pieceName === 'queen') chessPiece = new ChessPieceQueen(currentPlayerColor);
        if (pieceName === 'knight') chessPiece = new ChessPieceKnight(currentPlayerColor);
        
        this.chessBoard[this.pawnPositionLine][this.pawnPositionColumn].currentPiece = new ChessPiece(l, c, currentPlayerColor, chessPiece);
        
        // reset pawn
        this.pawnReachedEndOfChessBoard = false;
        this.pawnPositionColumn = null;
        this.pawnPositionLine = null;

        this.checkVerification(currentPlayerColor);
    }

    public selectPiece(l: number, c: number) {
        if (this.chessBoard[l][c]?.currentPiece && this.turnOfPlay === this.chessBoard[l][c].currentPiece?.color) {
            this.updateBoard();
            this.selectedPiece = this.chessBoard[l][c].currentPiece;
            this.previousLine = l;
            this.previousColumn = c;
            this.seePossibleMoves(l, c);
            this.mode = 'movePiece';
        }
    }

    private createInitialChessBoardArray() {
        this.chessBoard = new Array(8).fill(0).map((_, i) => new Array(8).fill(0).map((_,j) => ({
            squareColor: (i + j) % 2 === 1 ? '#0e857b' : '#ddcaca',
            currentPiece: null,
            isPossibleToMove: false,
            isSelected: false,
            isPreviousSelectedSquareMove: false,
            isPreviousTargetSquareMove: false,
            line: i,
            column: j,
        }) ));
    }

    private updateBoard() {
        this.chessBoard = this.chessBoard.map((line) => line.map(column => ({ ...column, isPossibleToMove: false, isSelected: false })) );
    }

    public startGame() {
        this.createInitialChessBoardArray();
        this.setPiecesInBoard();
        this.mode = 'selectPiece';
        this.turnOfPlay = 'white';
        this.checkMate = false;
        this.draw = false;
        this.whitePlayerOnCheck = false;
        this.blackPlayerOnCheck = false;
        this.pawnReachedEndOfChessBoard = false;
        this.deadPieces = [];
    }

    public changeModeToSelectMode() {
        this.updateBoard();
        this.mode = 'selectPiece';
    }

    public verifyIfPlayerIsOnCheck(color: 'white' | 'black', chessBoard: chessBoardArrayType): boolean {
        let itsOnCheck = false;
        chessBoard.map((line, l) => line.map((column, c) => {
            if(column.currentPiece && column.currentPiece.color === color) {
                if(column.currentPiece.piece.checkIfItsAttackingKing(color, this.chessBoard, l, c)) {
                    itsOnCheck = true;
                }
            }
        }));

        return itsOnCheck;
    }

    public verifyIfNextMoveWillBeCheck(
        colorOfPlayerBeeingAttacked: 'white' | 'black',
        targetLine: number,
        targetColumn: number,
        previousLine: number,
        previousColumn: number,
    ): boolean {
        const targetPiece = this.chessBoard[targetLine][targetColumn].currentPiece;
        const selectedPiece = this.chessBoard[previousLine][previousColumn].currentPiece;
        selectedPiece.setChessPiece(this.chessBoard, targetLine, targetColumn);

        const rockMove = !selectedPiece.piece.pieceHasAlreadyMove && selectedPiece.piece.kingPiece && (targetColumn === 6 || targetColumn === 2) && previousColumn === 4;
        let rookTargetColumn, rookTargetLine, rookPreviousLine, rookPreviousColumn, rookPiece, rookPieceTarget;

        if (rockMove) {
            rookPreviousLine = previousLine;
            rookPreviousColumn = targetColumn === 6 ? 7 : 0; 
            rookTargetLine = previousLine;
            rookTargetColumn = targetColumn === 6 ? 5 : 3;

            rookPiece = this.chessBoard[rookPreviousLine][rookPreviousColumn].currentPiece;
            rookPieceTarget = this.chessBoard[rookTargetLine][rookTargetColumn].currentPiece;
            rookPiece.setChessPiece(this.chessBoard, rookTargetLine, rookTargetColumn);
        }

        let check = false;
        const colorOfAttacker = colorOfPlayerBeeingAttacked === 'white' ? 'black' : 'white';

        if(this.verifyIfPlayerIsOnCheck(colorOfAttacker, this.chessBoard)) {
            check = true;
        }
        this.revertMove(targetLine, targetColumn, targetPiece, selectedPiece, previousLine, previousColumn);
        
        if (rockMove) {
            this.revertMove(rookTargetLine, rookTargetColumn, rookPieceTarget, rookPiece, rookPreviousLine, rookPreviousColumn);
        }

        return check;
    }

    private revertMove (
        targetLine: number,
        targetColumn: number,
        oldPiece: ChessPiece,
        selectedPiece: ChessPiece,
        previousLine: number,
        previousColumn: number,
    ) {
        this.updateBoard();
        selectedPiece.setChessPiece(this.chessBoard, previousLine, previousColumn);
        this.chessBoard[targetLine][targetColumn].currentPiece = oldPiece;
    }

    public verifyCheckMate(colorOfplayerBeingAttacked: 'white' | 'black'): boolean {
        const possibleResults: boolean[] = [];
        const board = new Array(8).fill(0).map(() => new Array(8).fill(0));
        const pieces: ChessPiece[] = [];

        board.map((line, previousLine: number) => line.map((_, previousColumn: number) => {
            const selectedPiece = this.chessBoard[previousLine][previousColumn].currentPiece;

            if (selectedPiece && selectedPiece.piece.color === colorOfplayerBeingAttacked){
                    
                const possibleMovesOfAttackedPlayer = selectedPiece.piece.checkPossibleMoves(this.chessBoard, previousLine, previousColumn);
                    
                pieces.push(selectedPiece);

                possibleMovesOfAttackedPlayer.map((lineX, targetLine) => lineX.map((isPossibleToMove, targetColumn)=> {
                    if(isPossibleToMove && selectedPiece) {
                        const result = this.verifyIfNextMoveWillBeCheck(colorOfplayerBeingAttacked, targetLine, targetColumn, previousLine, previousColumn);
                        possibleResults.push(result);
                    }
                }));

            }
        }) 
        );
        const checkMate = possibleResults.every(r => r);

        return checkMate;
    }

    public updateChessBoard(newBoard: ChessBoard): void {
        this.turnOfPlay = newBoard.turnOfPlay;
        this.checkMate = newBoard.checkMate;
        this.blackPlayerOnCheck = newBoard.blackPlayerOnCheck;
        this.whitePlayerOnCheck = newBoard.whitePlayerOnCheck;
        this.deadPieces = newBoard.deadPieces;

        newBoard.chessBoard.forEach((line, l) => 
            line.map((square, c) => {
                const newCurrentPieceName = square.currentPiece?.piece?.name;
                
                const newCurrentPieceColor: colorType = square.currentPiece?.color;

                this.chessBoard[l][c] = { ...this.chessBoard[l][c], ...square };

                this.chessBoard[l][c].currentPiece = null;

                if (newCurrentPieceColor) {
                    if (newCurrentPieceName === 'rook') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPieceRook(newCurrentPieceColor));
                    }
                    if (newCurrentPieceName === 'bishop') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPieceBishop(newCurrentPieceColor));
                    }
                    if (newCurrentPieceName === 'knight') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPieceKnight(newCurrentPieceColor));
                    }
                    if (newCurrentPieceName === 'pawn') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPiecePawn(newCurrentPieceColor));
                    }
                    if (newCurrentPieceName === 'queen') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPieceQueen(newCurrentPieceColor));
                    }
                    if (newCurrentPieceName === 'king') {
                        this.chessBoard[l][c].currentPiece = new ChessPiece(l, c, newCurrentPieceColor, new ChessPieceKing(newCurrentPieceColor));
                    }
                }
            })
        );

        this.checkVerification(this.turnOfPlay);
    }

}
