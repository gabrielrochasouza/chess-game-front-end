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

interface ContextProps{
    users: IPlayerInfo[],
    setUsers: (users: IPlayerInfo[]) => void,
    playerInfo: IPlayerInfo,
    setPlayerInfo: (user: IPlayerInfo) => void,
    onlineUsers: number,
    setOnlineUsers: (onlineUsers: number) => void,
}

const UsersContext = createContext<ContextProps>({} as ContextProps)

export const UsersProvider = ({children}:ProviderProps)=>{
    const [users, setUsers] = useState<IPlayerInfo[]>([]);
    const [playerInfo, setPlayerInfo] = useState<IPlayerInfo>({} as IPlayerInfo);
    const [onlineUsers, setOnlineUsers] = useState<number>(0);

    return(
        <UsersContext.Provider value={{ users, setUsers, playerInfo, setPlayerInfo, onlineUsers, setOnlineUsers }}>
            {children}
        </UsersContext.Provider>
    )
} 

export const useUsers = ()=> useContext(UsersContext)
