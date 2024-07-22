import { ChessBoard } from '@/models/ChessBoard';
import { IUserInfo } from './users.types';

export interface IChessGames {
    id: string,
    userId1: string,
    userId2: string,
    username1: string,
    username2: string,
    blackPieceUser: string,
    whitePieceUser: string,
    chatMessages: string,
    matchRequestMade: boolean,
    gameStarted: boolean,
    createdAt: string,
    updatedAt: string,
    user1: IUserInfo,
    user2: IUserInfo,
    userIdOfRequest: string,
}

export interface IChessBoardRoomsInstances {
    [key: string]: ChessBoard;
}

export interface IChatMessage {
    roomId: string,
    message: string,
    username: string,
    createdAt: Date,
}
export interface IChatMessagesRooms {
    [key: string]: IChatMessage[]; 
}
