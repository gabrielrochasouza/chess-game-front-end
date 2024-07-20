import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/dashboard';
import Room from '../pages/room';
import Login from '@/pages/login';
import Register from '@/pages/register';
import PrivateRoute from './privateRoute';
import Profile from '@/pages/profile';

const router = createBrowserRouter([
    {
        path: '/dashboard',
        element: (
            <PrivateRoute>
                <Dashboard />
            </PrivateRoute>
        ),
    },
    {
        path: '/dashboard/profile',
        element: (
            <PrivateRoute>
                <Profile />
            </PrivateRoute>
        ),
    },
    {
        path: '/dashboard/:personalUsername/:username/:roomId',
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