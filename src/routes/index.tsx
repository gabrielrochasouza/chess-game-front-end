import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import Room from '../pages/room';
import Login from '@/pages/login';
import Register from '@/pages/register';
import PrivateRoute from './privateRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        ),
    },
    {
        path: '/room/:roomId',
        element: (
            <PrivateRoute>
                <Room />
            </PrivateRoute>
        ),
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/*',
        element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        ),
    }
]);

export default router;