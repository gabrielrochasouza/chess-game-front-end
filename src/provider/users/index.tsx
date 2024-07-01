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
    createdAt: string,
    updatedAt: string,
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
}

const UsersContext = createContext<ContextProps>({} as ContextProps);

export const UsersProvider = ({children}:ProviderProps)=>{
    const [users, setUsers] = useState<IPlayerInfo[]>([]);
    const [playerInfo, setPlayerInfo] = useState<IPlayerInfo>({} as IPlayerInfo);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([] as string[]);
    const [chessGames, setChessGames] = useState<IChessGames[]>([] as IChessGames[]);

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
        }}>
            {children}
        </UsersContext.Provider>
    );
}; 

export const useUsers = ()=> useContext(UsersContext);
