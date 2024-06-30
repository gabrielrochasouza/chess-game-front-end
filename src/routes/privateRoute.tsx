import { checkToken } from '@/api';
import { useUsers } from '@/provider/users';
import { socket } from '@/socket-client/socket';
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { setOnlineUsers, setPlayerInfo } = useUsers();
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    
    useEffect(()=> {
        socket.on('handleConnection', (payload: {sender: string, numberOfUsers: number, users: Map<string, Socket>}) => {
            setOnlineUsers(payload.numberOfUsers);
        });
        socket.on('handleDisconnect', (payload: {sender: string, numberOfUsers: number, users: Map<string, Socket>}) => {
            setOnlineUsers(payload.numberOfUsers);
        });
        checkToken()
            .then(({ data }) => {
                localStorage.setItem('@UserInfo', JSON.stringify(data.user));
                setPlayerInfo(data.user);
                setIsAuthenticated(true);
            })
            .catch(() => {
                setIsAuthenticated(false);
                toast.error('Invalid Token Logout');
                localStorage.removeItem('@Token');
                localStorage.removeItem('@UserId');
                localStorage.removeItem('@ExpiresIn');
            });
    }, []);

    if (!localStorage.getItem('@Token')) {
        return <Navigate to="login" />;
    }

    if (localStorage.getItem('@ExpiresIn')) {
        const now = Date.now();
        const expiresIn = new Date(localStorage.getItem('@ExpiresIn')).valueOf();
        if (now > expiresIn) {
            localStorage.removeItem('@Token');
            localStorage.removeItem('@UserId');
            localStorage.removeItem('@ExpiresIn');
            toast.error('Login Time Expired');
            return <Navigate to="login" />;
        }
    }

    if (localStorage.getItem('@Token') && isAuthenticated) {
        return children; 
    }
};

export default PrivateRoute;
