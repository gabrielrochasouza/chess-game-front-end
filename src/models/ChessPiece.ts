import ChessPieceBishop from './ChessPieceBishop';
import ChessPieceKing from './ChessPieceKing';
import ChessPieceKnight from './ChessPieceKnight';
import ChessPiecePawn from './ChessPiecePawn';
import ChessPieceQueen from './ChessPieceQueen';
import ChessPieceRook from './ChessPieceRook';
import { chessBoardArrayType } from './types';

type PieceType = ChessPiecePawn | ChessPieceKnight | ChessPieceBishop | ChessPieceKing | ChessPieceQueen | ChessPieceRook;

export default class ChessPiece {
    constructor(l: number, c: number, color: 'white' | 'black', piece: PieceType){
        this.c = c;
        this.l = l;
        this.color = color;
        this.piece = piece;
    }
    l:number;
    c:number;
    color: 'white' | 'black';
    piece: PieceType;
    
    public setChessPiece (chessBoard: chessBoardArrayType, targetLine: number, targetColumn: number) {
        const currentPiece = chessBoard[this.l][this.c].currentPiece;
        const previousLine = this.l;
        const previousColumn = this.c;
        this.l = targetLine;
        this.c = targetColumn;
        chessBoard[previousLine][previousColumn].currentPiece = null;
        chessBoard[targetLine][targetColumn].currentPiece = currentPiece;
    }

}