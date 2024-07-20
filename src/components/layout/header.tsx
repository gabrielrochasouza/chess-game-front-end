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
import { HamburgerMenuIcon, BellIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';


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
                    <Button variant='outline' className='rounded-full w-12 h-12 p-0'>
                        <HamburgerMenuIcon className='w-6 h-6' />
                    </Button>
                </div>
                <div className='lg:mr-4 flex gap-4 item-center'>
                    <Button variant='outline' className='rounded-full w-12 h-12 p-2'>
                        <BellIcon className='w-6 h-6' />
                    </Button>
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
                                    <Link to={'/dashboard/profile'}>Edit Profile</Link>
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
