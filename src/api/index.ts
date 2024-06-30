import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: import.meta.env.VITE_DEV_API_URL
});

export const registerUser = async (userData: { username: string, password: string }) => {
    try {
        const response = await api.post('/users/register', userData);
        toast.success(`User '${userData.username}' created with success!!`);
        return response.data;
    } catch (e) {
        toast.error(e.response.data.message);
        return false;
    }
};

export const executeLogin = async (userData: { username: string, password: string }) => {
    try {
        const response = await api.post('/users/login', userData);

        toast.success('Successful login!');
        localStorage.setItem('@Token', response.data.token);
        localStorage.setItem('@UserId', response.data.id);
        localStorage.setItem('@ExpiresIn', response.data.expiresIn);

        return response.data;
    } catch (e) {
        toast.error(e.response.data.message);
        return false;
    }
}; 

export const checkToken = async () => {
    const token = localStorage.getItem('@Token');
    return api.get('/users/me', {
        headers: {
            authorization: `Bearer ${token}`, 
        }
    });
};

export const updateProfile = async (
    id: string,
    updateData: { username?: string, password?: string, profilePic?: string }
) => {
    const token = localStorage.getItem('@Token');
    return api.patch(`/users/${id}`, updateData, {
        headers: { authorization: `Bearer ${token}` }
    });
};

export const getUsers = () => {
    return api.get('/users');
};

export const deleteUser = async (id: string) => {
    const token = localStorage.getItem('@Token');
    return api.delete(`/users/${id}`, {
        headers: {
            authorization: `Bearer ${token}`, 
        }
    });
};
