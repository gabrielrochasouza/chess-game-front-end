import WhiteQueen from '../assets/svg/white_queen.svg';
import BlackQueen from '../assets/svg/black_queen.svg';
import { ClassPieceType, chessBoardArrayType, chessBoardType, pieceNamesType, possibleMovesType } from './types';
import ChessPieceBishop from './ChessPieceBishop';
import ChessPieceRook from './ChessPieceRook';


export default class ChessPieceQueen implements ClassPieceType {
    constructor(color: 'white' | 'black') {
        this.color = color;
        this.svgFile = color === 'white' ? WhiteQueen : BlackQueen;
    }
    name: pieceNamesType = 'queen';
    svgFile: string;
    color: 'white' | 'black';
    allPossibleMoves: possibleMovesType = new Array(8).fill(false).map(() => new Array(8).fill(false));
    kingPiece: boolean = false;
    pieceHasAlreadyMove: boolean = false;
    
    resetPossibleMoves() {
        this.allPossibleMoves = new Array(8).fill(false).map(() => new Array(8).fill(false));
    }

    queenPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number): boolean[][] {
        this.resetPossibleMoves();
        const allPossibleMoves = this.allPossibleMoves;
        const rookPossibleMoves = new ChessPieceRook(this.color).rookPossibleMoves(chessBoard, l, c);
        const bishopPossibleMoves = new ChessPieceBishop(this.color).bishopPossibleMoves(chessBoard, l, c);

        return allPossibleMoves.map((line, l)=> line.map((_, c) => rookPossibleMoves[l][c] || bishopPossibleMoves[l][c] ) );
    }

    setPossibleMoves(chessBoard: chessBoardArrayType, l: number, c: number) {
        this.allPossibleMoves = this.queenPossibleMoves(chessBoard, l, c);
        return chessBoard.map((line: chessBoardType[], l: number) => line.map((column: chessBoardType, c: number) => ({...column, isPossibleToMove: this.allPossibleMoves[l][c]})));
    }

    checkIfItsAttackingKing (color: 'white' | 'black', chessBoard: chessBoardArrayType, l: number, c: number):boolean {
        this.allPossibleMoves = this.queenPossibleMoves(chessBoard, l, c);
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
        return this.queenPossibleMoves(chessBoard, l, c);
    }

}