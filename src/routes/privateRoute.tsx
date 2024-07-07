import { checkToken } from '@/api';
import { useUsers } from '@/provider/users';
import { socket } from '@/socket-client/socket';
import { logout } from '@/utils';
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingBar from 'react-top-loading-bar';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { setOnlineUsers, setPlayerInfo, setChessGames } = useUsers();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [progress, setProgress] = useState(0);

    const expiresIn = localStorage.getItem('@ExpiresIn') ? new Date(localStorage.getItem('@ExpiresIn')).valueOf() : null;

    useEffect(()=> {
        socket.on('handleConnect', (payload: {sender: string, numberOfUsers: number, users: string[]}) => {
            setOnlineUsers(payload.users);
        });
        socket.on('handleDisconnect', (payload: {sender: string, numberOfUsers: number, users: string[]}) => {
            setOnlineUsers(payload.users);
        });

        if (!expiresIn || Date.now() < expiresIn) {
            setProgress(30);
            checkToken()
                .then(({ data }) => {
                    localStorage.setItem('@UserInfo', JSON.stringify(data.user));
                    setPlayerInfo(data.user);
                    setChessGames(data.chessGames);
                    setIsAuthenticated(true);
                    socket.emit('UserConnected', data.user);
                })
                .catch(() => {
                    setIsAuthenticated(false);
                    logout();
                })
                .finally(() => {
                    setProgress(100);
                });
        }
    }, []);

    if (expiresIn && Date.now() > expiresIn) {
        logout();
        toast.error('Login Time Expired');
        return <Navigate to='login' />;
    }

    if (!localStorage.getItem('@Token') || !localStorage.getItem('@UserId')) {
        logout();
        return <Navigate to='login' />;
    }

    if (localStorage.getItem('@Token') && isAuthenticated) {
        return (
            <>
                <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
                {children}
            </>
        ); 
    }
};

export default PrivateRoute;
