import ChessPiece from './ChessPiece';

export type chessBoardType = {
    squareColor: string,
    currentPiece?: ChessPiece | null,
    isPossibleToMove: boolean,
    isSelected: boolean,
    isPreviousSelectedSquareMove: boolean,
    isPreviousTargetSquareMove: boolean,
    line: number,
    column: number,
}

export type colorType = 'white' | 'black';

export type possibleMovesType = boolean[][];

export type chessBoardArrayType = chessBoardType[][];

export type pieceNamesType = 'pawn' | 'queen' | 'king' | 'knight' | 'bishop' | 'rook';

export interface ClassPieceType {
    name: pieceNamesType,
    pieceHasAlreadyMove: boolean,
    svgFile: string,
    color: colorType,
    allPossibleMoves: possibleMovesType,
    kingPiece: boolean,
    resetPossibleMoves: ()=> void,
    setLinesAndColumns?: (l: number, c: number) => {
        nextLine: number,
        nextColumn: number,
        previousLine: number,
        previousColumn: number,
    },
    setPossibleMoves: (chessBoard: chessBoardArrayType, l: number, c: number) => chessBoardArrayType,
    checkIfItsAttackingKing: (color: colorType, chessBoard: chessBoardArrayType, l: number, c: number) => boolean,
    checkPossibleMoves: (chessBoard: chessBoardArrayType, l: number, c: number)=> possibleMovesType,
}

