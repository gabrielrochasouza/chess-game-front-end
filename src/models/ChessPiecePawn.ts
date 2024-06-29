import WhitePawn from '../assets/svg/white_pawn.svg';
import BlackPawn from '../assets/svg/black_pawn.svg';
import { ClassPieceType, chessBoardArrayType, chessBoardType, pieceNamesType, possibleMovesType } from './types';


export default class ChessPiecePawn implements ClassPieceType {
    constructor(color: 'white' | 'black') {
        this.color = color;
        this.svgFile = color === 'white' ? WhitePawn : BlackPawn;
    }
    name: pieceNamesType = 'pawn';
    svgFile: string;
    color: 'white' | 'black'
    allPossibleMoves: possibleMovesType = new Array(8).fill(false).map(() => new Array(8).fill(false));
    kingPiece: boolean = false;
    pieceHasAlreadyMove: boolean = false;

    resetPossibleMoves() {
        this.allPossibleMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));
    }

    pawnPossibleMoves(chessBoard: chessBoardArrayType, l:number, c: number): boolean[][] {
        this.resetPossibleMoves();

        const allPossibleMoves = this.allPossibleMoves;
        if(this.color === 'black') {
            if(l == 1) {
                if(!chessBoard[l + 1][c].currentPiece) allPossibleMoves[l + 1][c] = true;
                if(!chessBoard[l + 1][c].currentPiece && !chessBoard[l + 2][c].currentPiece) allPossibleMoves[l + 2][c] = true;
            }
            if(l + 1 <= 7 && !chessBoard[l + 1][c].currentPiece) allPossibleMoves[l + 1][c] = true;
            if(l + 1 <= 7 && c + 1 <= 7) (chessBoard[l + 1][c + 1].currentPiece && chessBoard[l + 1][c + 1].currentPiece?.color !== this.color) && (allPossibleMoves[l + 1][c + 1] = true);
            if(l + 1 <= 7 && c - 1 >= 0) (chessBoard[l + 1][c - 1].currentPiece && chessBoard[l + 1][c - 1].currentPiece?.color !== this.color) && (allPossibleMoves[l + 1][c - 1] = true);
        }

        if(this.color === 'white') {
            if(l == 6) {
                if(!chessBoard[l - 1][c].currentPiece) allPossibleMoves[l - 1 ][c] = true;
                if(!chessBoard[l - 1][c].currentPiece && !chessBoard[l - 2][c].currentPiece) allPossibleMoves[l - 2][c] = true;
            }
            if(l - 1 >= 0 && !chessBoard[l - 1][c].currentPiece)  allPossibleMoves[l - 1][c] = true;
            if(l - 1 >= 0 && c + 1 <= 7) (chessBoard[l - 1][c + 1].currentPiece && chessBoard[l - 1][c + 1].currentPiece?.color !== this.color) && (allPossibleMoves[l - 1][c + 1] = true);
            if(l - 1 >= 0 && c - 1 >= 0) (chessBoard[l - 1][c - 1].currentPiece && chessBoard[l - 1][c - 1].currentPiece?.color !== this.color) && (allPossibleMoves[l - 1][c - 1] = true);
        }
        return allPossibleMoves;
    }
    setPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        this.allPossibleMoves = this.pawnPossibleMoves(chessBoard, l, c);
        return chessBoard.map((line: chessBoardType[], lIndex: number) => line.map((column: chessBoardType, cIndex: number) => ({...column, isPossibleToMove: this.allPossibleMoves[lIndex][cIndex]})))
    }

    checkIfItsAttackingKing (color: 'white' | 'black', chessBoard: chessBoardArrayType, l: number, c: number):boolean {
        this.allPossibleMoves = this.pawnPossibleMoves(chessBoard, l, c);
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
        return this.pawnPossibleMoves(chessBoard, l, c);
    }

}
