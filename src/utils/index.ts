import { socket } from '@/socket-client/socket';
import { toast } from 'react-toastify';

export const logout = () => {
    toast.error('Invalid Token');
    if (localStorage.getItem('@UserId')) {
        socket.emit('UserDisconnected', localStorage.getItem('@UserId'));
    }
    localStorage.removeItem('@UserInfo');
    localStorage.removeItem('@Token');
    localStorage.removeItem('@UserId');
    localStorage.removeItem('@ExpiresIn');
};
