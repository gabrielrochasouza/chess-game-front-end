import WhiteBishop from '../assets/svg/white_bishop.svg';
import BlackBishop from '../assets/svg/black_bishop.svg';
import { ClassPieceType, chessBoardArrayType, chessBoardType, pieceNamesType, possibleMovesType } from './types';


export default class ChessPieceBishop implements ClassPieceType {
    constructor(color: 'white' | 'black') {
        this.color = color;
        this.svgFile = color === 'white' ? WhiteBishop : BlackBishop;
    }
    name: pieceNamesType = 'bishop';
    svgFile: string;
    color: 'white' | 'black';
    allPossibleMoves: possibleMovesType = new Array(8).fill(false).map(() => new Array(8).fill(false));
    kingPiece: boolean = false;
    pieceHasAlreadyMove: boolean = false;

    resetPossibleMoves() {
        this.allPossibleMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));
    }

    setLinesAndColumns(l: number, c: number) {
        return {
            nextLine: l + 1,
            nextColumn: c + 1,
            previousLine: l - 1,
            previousColumn: c - 1,
        };
    }

    bishopPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number): boolean[][] {
        this.resetPossibleMoves();
        let {nextLine, nextColumn, previousLine, previousColumn} = this.setLinesAndColumns(l, c);

        const allPossibleMoves = this.allPossibleMoves;

        while (nextLine <= 7 && nextColumn <= 7) {
            if(!chessBoard[nextLine][nextColumn].currentPiece || chessBoard[nextLine][nextColumn].currentPiece?.color !== this.color) {
                allPossibleMoves[nextLine][nextColumn] = true;
            }
            if(chessBoard[nextLine][nextColumn].currentPiece) break;
            nextLine = nextLine + 1;
            nextColumn = nextColumn + 1;
        }

        ({nextLine, nextColumn, previousLine, previousColumn} = this.setLinesAndColumns(l, c));
        while (nextLine <= 7 && previousColumn >= 0) {
            if(!chessBoard[nextLine][previousColumn].currentPiece || chessBoard[nextLine][previousColumn].currentPiece?.color !== this.color) {
                allPossibleMoves[nextLine][previousColumn] = true;
            }
            if(chessBoard[nextLine][previousColumn].currentPiece) break;
            nextLine = nextLine + 1;
            previousColumn = previousColumn - 1;
        }

        ({nextLine, nextColumn, previousLine, previousColumn} = this.setLinesAndColumns(l, c));
        while (previousLine >= 0 &&  nextColumn <= 7) {
            if(!chessBoard[previousLine][nextColumn].currentPiece || chessBoard[previousLine][nextColumn].currentPiece?.color !== this.color) {
                allPossibleMoves[previousLine][nextColumn] = true;
            }
            if(chessBoard[previousLine][nextColumn].currentPiece) break;
            previousLine = previousLine - 1;
            nextColumn = nextColumn + 1;
        }

        ({nextLine, nextColumn, previousLine, previousColumn} = this.setLinesAndColumns(l, c));
        while (previousLine >= 0 && previousColumn >= 0 ) {
            if(!chessBoard[previousLine][previousColumn].currentPiece || chessBoard[previousLine][previousColumn].currentPiece?.color !== this.color) {
                allPossibleMoves[previousLine][previousColumn] = true;
            }
            if(chessBoard[previousLine][previousColumn].currentPiece) break;
            previousLine = previousLine - 1;
            previousColumn = previousColumn - 1;
        }
        return allPossibleMoves;
    }

    setPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        this.allPossibleMoves = this.bishopPossibleMoves(chessBoard, l, c);
        return chessBoard.map((line: chessBoardType[], l: number) => line.map((column: chessBoardType, c: number) => ({...column, isPossibleToMove: this.allPossibleMoves[l][c]})));
    }

    checkIfItsAttackingKing (color: 'white' | 'black', chessBoard: chessBoardArrayType, l: number, c: number):boolean {
        this.allPossibleMoves = this.bishopPossibleMoves(chessBoard, l, c);
        let result = false;
        chessBoard.map((line: chessBoardType[], l: number) => line.map((column: chessBoardType, c: number) => {
            if(
                this.allPossibleMoves[l][c] && 
                column.currentPiece && 
                column.currentPiece.piece.color !== color && 
                column.currentPiece.piece.kingPiece
            ) {
                result = true;
            }
        }) );
        return result;
    }

    checkPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        return this.bishopPossibleMoves(chessBoard, l, c);
    }

}