import axios from 'axios';
import { toast } from 'react-toastify';
// import { env } from 'process';

const api = axios.create({
    // baseURL: process.env['DEV_API_URL'],
    baseURL: 'http://localhost:3333'
})

export const registerUser = async (userData: { username: string, password: string }) => {
    try {
        const response = await api.post('/users/register', userData);
        toast.success(`User '${userData.username}' created with success!!`);
        return response.data;
    } catch (e) {
        toast.error(e.response.data.message);
        return false;
    }
}

export const executeLogin = async (userData: { username: string, password: string }) => {
    try {
        const response = await api.post('/users/login', userData);

        toast.success('Successful login!');
        localStorage.setItem('@Token', response.data.token);
        localStorage.setItem('@UserId', response.data.id);

        return response.data;
    } catch (e) {
        toast.error(e.response.data.message);
        return false;
    }
} 

export const checkToken = async () => {
    const token = localStorage.getItem('@Token');
    return api.get('/users/me', {
        headers: {
            authorization: `Bearer ${token}`, 
        }
    });
}

export const getUsers = () => {
    return api.get('/users');
}
