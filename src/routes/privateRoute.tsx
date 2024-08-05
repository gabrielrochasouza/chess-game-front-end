import { checkToken } from '@/api';
import { useUsers } from '@/provider/users';
import { socket } from '@/socket-client/socket';
import { logout } from '@/utils';
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import WhiteKnight from '@/assets/svg/white_knight.svg';
import { ChessBoard } from '@/models/ChessBoard';
import NewNotification from '@/assets/sound/new-notification.mp3';

interface PrivateRouteProps {
  children: ReactNode;
}

interface IMovePieceGlobal {
    selectedLine: number,
    selectedColumn: number,
    targetLine: number,
    targetColumn: number,
    chessRoomId: string,
    userId: string,
}

interface IChessBoardRoomsInstances {
    [key: string]: ChessBoard;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { setOnlineUsers, setPlayerInfo, setChessGames, playerInfo, setNotifications, chessGames, chessBoardRoomsInstances, setChessBoardRoomsInstances, onlineUsers } = useUsers();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const expiresIn = localStorage.getItem('@ExpiresIn') ? new Date(localStorage.getItem('@ExpiresIn')).valueOf() : null;

    const loadPersonalInfo = ()=> {
        checkToken()
            .then(({ data }) => {
                localStorage.setItem('@UserInfo', JSON.stringify(data.user));
                setPlayerInfo(data.user);
                setNotifications(data.user.notifications);
                setChessGames(data.chessGames);
                setIsAuthenticated(true);
                socket.emit('UserConnected', data.user);
            })
            .catch(() => {
                setIsAuthenticated(false);
                logout();
            });
    };

    useEffect(()=> {
        socket.on('handleConnectUser', (payload: {sender: string, numberOfUsers: number, users: string[]}) => {
            setOnlineUsers(payload.users);
            const newUserId = payload.sender;
            const allRoomsTheUserIsIn = chessGames.filter(chessGame => chessGame.userId1 === newUserId || chessGame.userId2 === newUserId)
                .map(c => c.id);

            const allChessInstances: IChessBoardRoomsInstances = {};

            Object.entries(chessBoardRoomsInstances).forEach(([roomId, chessBoardRoomInstance]) => {
                if (allRoomsTheUserIsIn.includes(roomId)) {
                    allChessInstances[roomId] = chessBoardRoomInstance;
                }
            });
            if (allRoomsTheUserIsIn.length) {
                socket.emit('reload-instances', {  userId: newUserId, allChessInstances: allChessInstances });
            }
        });

        socket.on('reload-instances', (payload: { userId: string, allChessInstances: IChessBoardRoomsInstances }) => {
            const userId = localStorage.getItem('@UserId');
            if (userId === payload.userId) {
                Object.entries(payload.allChessInstances).forEach(([key, value]) => {
                    if (chessBoardRoomsInstances[key]) {
                        chessBoardRoomsInstances[key].updateChessBoard(value);
                    }
                });
                setChessBoardRoomsInstances(chessBoardRoomsInstances);
            }
        });

        return () => {
            socket.off('reload-instances');
            socket.off('handleConnectUser');
        };
    }, [onlineUsers]);

    useEffect(()=> {
        socket.on('movePieceGlobal', ({ selectedLine, selectedColumn, targetLine, targetColumn, chessRoomId }: IMovePieceGlobal) => {
            chessBoardRoomsInstances[chessRoomId].selectPiece(selectedLine, selectedColumn);
            chessBoardRoomsInstances[chessRoomId].movePiece(targetLine, targetColumn);
        });

        return () => {
            socket.off('movePieceGlobal');
        };
    }, [chessBoardRoomsInstances]);

    useEffect(()=> {
        chessGames.forEach(chessGame => {
            if (chessGame.gameStarted && !chessBoardRoomsInstances[chessGame.id]) {
                const userId = localStorage.getItem('@UserId');
                const userColor = chessGame.blackPieceUser === userId ? 'black' : 'white';
                chessBoardRoomsInstances[chessGame.id] = new ChessBoard(chessGame.id, userColor);
                setChessBoardRoomsInstances({ ...chessBoardRoomsInstances });
            }
        });
    }, [chessBoardRoomsInstances, chessGames]);

    useEffect(()=> {
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
                        setNotifications(data.user.notifications);
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
        socket.on('sendNotification', (payload: { targetUserId: string, message: string, createdAt: string, username: string, roomId: string, readMessageAt: string, }) => {
            new Audio(NewNotification).play();
            const playerId = localStorage.getItem('@UserId') || playerInfo.id;
            if (payload.targetUserId === playerId) {
                checkToken()
                    .then(({ data }) => {
                        localStorage.setItem('@UserInfo', JSON.stringify(data.user));
                        setPlayerInfo(data.user);
                        setNotifications(data.user.notifications);
                    })
                    .catch(() => {
                        setIsAuthenticated(false);
                        logout();
                    });
            }
        });

        if (!expiresIn || Date.now() < expiresIn) {
            loadPersonalInfo();
        }

        return () => {
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

    return localStorage.getItem('@Token') && isAuthenticated ? <>{children}</> : (
        <div className='h-screen w-full flex justify-center items-center text-2xl'>
            <div className='text-center'>
                <img className='w-20 h-20 mb-4' src={WhiteKnight} />
                <div>
                    Loading...
                </div>
            </div>
        </div>
    ); 
};

export default PrivateRoute;
