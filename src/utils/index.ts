import { socket } from '@/socket-client/socket';

export const logout = () => {
    if (localStorage.getItem('@UserId')) {
        socket.emit('UserDisconnected', localStorage.getItem('@UserId'));
    }
    localStorage.removeItem('@UserInfo');
    localStorage.removeItem('@Token');
    localStorage.removeItem('@UserId');
    localStorage.removeItem('@ExpiresIn');
};
