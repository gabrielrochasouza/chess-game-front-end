import WhiteQueen from '@/assets/svg/white_queen.svg';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from '@/components/ui/menubar';
import { useUsers } from '@/provider/users';
import { logout } from '@/utils';

export default function Header() {
    const { playerInfo } = useUsers();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className='fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20'>
            <nav className='h-14 flex items-center justify-between px-4'>
                <div className='block'>
                    <Link to={'/'}>
                        <img src={WhiteQueen}/> 
                    </Link>
                </div>
                <div className='lg:mr-4'>
                    <Menubar className='p-0 m-0 bg-transparent rounded-full'>
                        <MenubarMenu>
                            <MenubarTrigger className='p-0 m-0 rounded-full'>
                                <Avatar>
                                    <AvatarImage src={playerInfo?.profilePic} className='object-cover' />
                                    <AvatarFallback>C</AvatarFallback>
                                </Avatar>
                            </MenubarTrigger>
                            <MenubarContent>
                                <MenubarItem>
                                    {playerInfo?.username}
                                    <MenubarShortcut>Username</MenubarShortcut>
                                </MenubarItem>
                                <MenubarItem>
                                    <Link to={'/dashboard/profile'}>
                                        Edit Profile
                                    </Link>
                                </MenubarItem>
                                <MenubarSeparator />
                                <MenubarItem onClick={handleLogout}>Logout</MenubarItem>
                            </MenubarContent>
                        </MenubarMenu>
                    </Menubar>
                    
                </div>
            </nav>
        </div>
    );
}
