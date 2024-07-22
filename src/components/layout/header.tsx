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


interface INotification {
    message: string,
    createdAt: string,
    targetUserId: string,
    username: string,
    roomId: string,
}


export default function Header() {
    const { playerInfo, menuOpened, setMenuOpened, notifications, setNotifications } = useUsers();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const handleNavigateToPage = (payload: INotification) => {
        if (payload.username && payload.roomId) {
            navigate(`/dashboard/${localStorage.getItem('@UserId')}/${payload.username}/${payload.roomId}`);
        }
    };

    return (
        <div className='fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-30'>
            <nav className='h-14 flex items-center justify-between px-4'>
                <div className='block'>
                    <Button variant='outline' className='rounded-full w-12 h-12 p-0' onClick={() => setMenuOpened(!menuOpened)}>
                        <HamburgerMenuIcon className='w-6 h-6' />
                    </Button>
                </div>
                <div className='lg:mr-4 flex gap-4 item-center'>
                    
                    <Menubar className='p-0 m-0 bg-transparent rounded-full border-0'>
                        <MenubarMenu>
                            <MenubarTrigger className='p-0 m-0 rounded-full border-0'>
                                <Button variant='ghost' className='rounded-full w-12 h-12 p-2 relative border-0'>
                                    <BellIcon className='w-6 h-6' />
                                    {notifications.length ? (
                                        <div className='absolute bottom-1 right-1 rounded-full bg-red-800 text-white flex justify-center items-center min-w-4 min-h-4 text-[11px]'>
                                            {notifications.length}
                                        </div>
                                    ) : (<></>)}
                                </Button>
                            </MenubarTrigger>
                            {notifications.length ? (
                                <MenubarContent className='pb-1 mr-8 min-w-80 max-w-80'>
                                    <MenubarItem className='text-lg'>Notifications</MenubarItem>
                                    <MenubarSeparator />
                                    <div className='overflow-auto max-h-80 max-w-80 px-0'>
                                        {notifications.slice(0).reverse().map((notification, index) => (
                                            <MenubarItem key={index} className='pt-4 pb-10 px-1 relative' onClick={() => handleNavigateToPage(notification)}>
                                                <p className='line-clamp-2 max-w-full'>🟡 {notification.message}</p>
                                                <span className='absolute right-2 bottom-0 text-[11px] text-slate-400'>{new Date(notification.createdAt).toLocaleString()}</span>
                                            </MenubarItem>
                                        ))}
                                    </div>
                                    <Button className='mt-4 w-full' variant='secondary' onClick={() => setNotifications([])}>
                                        Clear All Notifications
                                    </Button>
                                </MenubarContent>
                            ) : ''}
                        </MenubarMenu>
                    </Menubar>
                    
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
