import { ReactNode,createContext,useContext,useState } from 'react';

interface ProviderProps{
    children: ReactNode
}

interface ContextProps{
    isAuthenticated: boolean
}

const AuthContext = createContext<ContextProps>({} as ContextProps)

export const AuthProvider = ({children}:ProviderProps)=>{
    const [isAuthenticated] = useState(false);

    return(
        <AuthContext.Provider value={{ isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
} 

export const useAuth = ()=> useContext(AuthContext)
