import { checkToken } from '@/api';
import { useUsers } from '@/provider/users';
import { socket } from '@/socket-client/socket';
import { logout } from '@/utils';
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import LoadingBar from 'react-top-loading-bar';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { setOnlineUsers, setPlayerInfo, setChessGames, playerInfo, updateNotifications } = useUsers();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const [progress, setProgress] = useState(0);

    const expiresIn = localStorage.getItem('@ExpiresIn') ? new Date(localStorage.getItem('@ExpiresIn')).valueOf() : null;

    const loadPersonalInfo = ()=> {
        // setProgress(30);
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
                // setProgress(100);
            });
    };

    useEffect(()=> {
        socket.on('handleConnectUser', (payload: {sender: string, numberOfUsers: number, users: string[]}) => {
            setOnlineUsers(payload.users);
        });
        socket.on('handleDisconnectUser', (payload: {sender: string, numberOfUsers: number, users: string[]}) => {
            setOnlineUsers(payload.users);
        });
        socket.on('reloadGlobal', (payload: { userId: string }) => {
            const playerId = localStorage.getItem('@UserId') || playerInfo.id;
            if (payload.userId === playerId) {
                checkToken()
                    .then(({ data }) => {
                        localStorage.setItem('@UserInfo', JSON.stringify(data.user));
                        setPlayerInfo(data.user);
                        setChessGames(data.chessGames);
                        socket.emit('UserConnected', data.user);
                    })
                    .catch(() => {
                        setIsAuthenticated(false);
                        logout();
                    });
            }
        });
        socket.on('initialEvent', () => {
            if (localStorage.getItem('@UserInfo')) {
                socket.emit('UserConnected', JSON.parse(localStorage.getItem('@UserInfo')));
            }
        });
        socket.on('sendNotification', (payload: { targetUserId: string, message: string, createdAt: string, username: string, roomId: string }) => {
            const playerId = localStorage.getItem('@UserId') || playerInfo.id;
            if (payload.targetUserId === playerId) {
                updateNotifications(payload);
            }
        });

        if (!expiresIn || Date.now() < expiresIn) {
            loadPersonalInfo();
        }

        return () => {
            socket.off('movePiece');
            socket.off('initialEvent');
            socket.off('reloadGlobal');
            socket.off('handleDisconnectUser');
            socket.off('handleConnectUser');
            socket.off('sendNotification');
        };
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
                {/* <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} /> */}
                {children}
            </>
        ); 
    }
};

export default PrivateRoute;
