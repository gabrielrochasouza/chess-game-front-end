import WhiteKnight from '../assets/svg/white_knight.svg';
import BlackKnight from '../assets/svg/black_knight.svg';
import { ClassPieceType, chessBoardArrayType, chessBoardType, pieceNamesType, possibleMovesType } from './types';


export default class ChessPieceKnight implements ClassPieceType {
    constructor(color: 'white' | 'black') {
        this.color = color;
        this.svgFile = color === 'white' ? WhiteKnight : BlackKnight;
    }
    name: pieceNamesType = 'knight';
    svgFile: string;
    color: 'white' | 'black';
    allPossibleMoves: possibleMovesType = new Array(8).fill(false).map(() => new Array(8).fill(false));
    kingPiece: boolean = false;
    pieceHasAlreadyMove: boolean = false;

    resetPossibleMoves() {
        this.allPossibleMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));
    }

    knightPossibleMoves(chessBoard: chessBoardArrayType, l:number, c: number): boolean[][] {
        this.resetPossibleMoves();
        const allPossibleMoves = this.allPossibleMoves;

        if(l + 2 <= 7 && c + 1 <=7) chessBoard[l + 2][c + 1].currentPiece?.color !== this.color && (allPossibleMoves[l + 2][c + 1] = true);
        if(l + 2 <=7 && c - 1 >= 0) chessBoard[l + 2][c - 1].currentPiece?.color !== this.color && (allPossibleMoves[l + 2][c - 1] = true);
        if(l - 2 >= 0 && c + 1 <=7) chessBoard[l - 2][c + 1].currentPiece?.color !== this.color && (allPossibleMoves[l - 2][c + 1] = true);
        if(l - 2 >= 0 && c - 1 >= 0) chessBoard[l - 2][c - 1].currentPiece?.color !== this.color && (allPossibleMoves[l - 2][c - 1] = true);
        if(l + 1 <=7 && c + 2 <=7) chessBoard[l + 1][c + 2].currentPiece?.color !== this.color && (allPossibleMoves[l + 1][c + 2] = true);
        if(l + 1 <=7 && c - 2 >= 0) chessBoard[l + 1][c - 2].currentPiece?.color !== this.color && (allPossibleMoves[l + 1][c - 2] = true);
        if(l - 1 >= 0 && c + 2 <=7) chessBoard[l - 1][c + 2].currentPiece?.color !== this.color && (allPossibleMoves[l - 1][c + 2] = true);
        if(l - 1 >= 0 && c - 2 >= 0) chessBoard[l - 1][c - 2].currentPiece?.color !== this.color && (allPossibleMoves[l - 1][c - 2] = true);
        
        return allPossibleMoves;
    }

    setPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        this.allPossibleMoves = this.knightPossibleMoves(chessBoard, l, c);
        return chessBoard.map((line: chessBoardType[], l: number) => line.map((column: chessBoardType, c: number) => ({...column, isPossibleToMove: this.allPossibleMoves[l][c]})))
    }

    checkIfItsAttackingKing (color: 'white' | 'black', chessBoard: chessBoardArrayType, l: number, c: number):boolean {
        this.allPossibleMoves = this.knightPossibleMoves(chessBoard, l, c);
        let result = false;
        chessBoard.map((line: chessBoardType[], l: number) => line.map((column: chessBoardType, c: number) => {
            if(
                this.allPossibleMoves[l][c] &&
                column.currentPiece &&
                column.currentPiece.color !== color &&
                column.currentPiece.piece.kingPiece
            ) {
                result = true;
            }
        }) );
        return result;
    }

    checkPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        return this.knightPossibleMoves(chessBoard, l, c);
    }

}
