import { ReactNode } from 'react';
import { AuthProvider } from './auth';
import { UsersProvider } from './users';

interface ChildrenProps {
  children: ReactNode;
}

const Provider = ({ children }: ChildrenProps) => {
    return (
        <UsersProvider>
            <AuthProvider>{children}</AuthProvider>
        </UsersProvider>
    );
};

export default Provider;