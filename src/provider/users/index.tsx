import { saveChat } from '@/api';
import { ChessBoard } from '@/models/ChessBoard';
import { socket } from '@/socket-client/socket';
import { ReactNode,createContext,useContext,useState } from 'react';

interface ProviderProps {
    children: ReactNode
}

interface IPlayerInfo {
    id: string,
    username: string,
    active: boolean,
    wins: number,
    loses: number,
    draws: number,
    profilePic: string,
    createdAt: string,
    updatedAt: string,
    position: number,
}

interface IChessGames {
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
    user1: IPlayerInfo,
    user2: IPlayerInfo,
}

interface ContextProps{
    users: IPlayerInfo[],
    setUsers: (users: IPlayerInfo[]) => void,
    playerInfo: IPlayerInfo,
    setPlayerInfo: (user: IPlayerInfo) => void,
    onlineUsers: string[],
    setOnlineUsers: (onlineUsers: string[]) => void,
    chessGames: IChessGames[],
    setChessGames: (chessGames: IChessGames[]) => void,
    chessBoardRoomsInstances: IChessBoardRoomsInstances,
    setChessBoardRoomsInstances: (chessBoardRoomsInstances: IChessBoardRoomsInstances) => void,
    chatMessagesRooms: IChatMessagesRooms,
    sendChatMessageToRoom: ({message, roomId, username}: { message: string, roomId: string, username: string }) => void,
    setChatMessagesRooms: (chatMessagesRooms: IChatMessagesRooms) => void,
}

interface IChessBoardRoomsInstances {
    [key: string]: ChessBoard;
}

interface IChatMessage {
    roomId: string,
    message: string,
    username: string,
    createdAt: Date,
}
interface IChatMessagesRooms {
    [key: string]: IChatMessage[]; 
}

const UsersContext = createContext<ContextProps>({} as ContextProps);

export const UsersProvider = ({children}:ProviderProps)=>{
    const [users, setUsers] = useState<IPlayerInfo[]>([]);
    const [playerInfo, setPlayerInfo] = useState<IPlayerInfo>({} as IPlayerInfo);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([] as string[]);
    const [chessGames, setChessGames] = useState<IChessGames[]>([] as IChessGames[]);
    const [chessBoardRoomsInstances, setChessBoardRoomsInstances] = useState<IChessBoardRoomsInstances>({} as IChessBoardRoomsInstances);
    const [chatMessagesRooms, setChatMessagesRooms] = useState<IChatMessagesRooms>({} as IChatMessagesRooms);

    const sendChatMessageToRoom = ({ message, roomId, username }: { message: string, roomId: string, username: string }) => {
        const newMessage: IChatMessage = { createdAt: new Date(), message, roomId, username };

        const updatedMessages = chatMessagesRooms[roomId] ? {
            ...chatMessagesRooms, [roomId]: [ ...chatMessagesRooms[roomId], newMessage ],
        } : {
            ...chatMessagesRooms, [roomId]: [ newMessage ]
        };

        saveChat(roomId, JSON.stringify(updatedMessages[roomId]));

        if (updatedMessages) {
            setChatMessagesRooms(updatedMessages);
        }
        socket.emit('sendChatMessage', { messages: updatedMessages[roomId], roomId, username: playerInfo.username });
    }; 

    return(
        <UsersContext.Provider value={{
            users,
            setUsers,
            playerInfo,
            setPlayerInfo,
            onlineUsers,
            setOnlineUsers,
            chessGames,
            setChessGames,
            chessBoardRoomsInstances,
            setChessBoardRoomsInstances,
            chatMessagesRooms,
            sendChatMessageToRoom,
            setChatMessagesRooms,
        }}>
            {children}
        </UsersContext.Provider>
    );
}; 

export const useUsers = ()=> useContext(UsersContext);
