import { DashboardNav } from '@/components/dashboard-nav';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Link, useParams } from 'react-router-dom';
import { MenubarSeparator } from '@/components/ui/menubar';
import { useUsers } from '@/provider/users';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';


interface NavItem {
    title: string;
    href?: string;
    disabled?: boolean;
    external?: boolean;
    icon?: keyof typeof Icons;
    label?: string;
    description?: string;
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: 'dashboard',
        label: 'Dashboard',
    },
    {
        title: 'Profile',
        href: '/dashboard/profile',
        icon: 'profile',
        label: 'profile',
    },
    {
        title: 'Logout',
        href: '/login',
        icon: 'logout',
        label: 'logout',
    },
];

export default function Sidebar() {
    const { chessGames, playerInfo, onlineUsers, menuOpened, chessBoardRoomsInstances, setMenuOpened } = useUsers();
    const { username } = useParams();

    const onlineUsersIds: { [key: string]: boolean } = {};
    
    onlineUsers.forEach(user => {
        onlineUsersIds[user] = true;
    });

    const stringToColor = (str: string) => {
        let hex = '';
        for(let i=0;i<str.length;i++) {
            hex += ''+str.charCodeAt(i).toString(16);
        }
        return hex;
    };

    const handleCloseMenu = () => {
        if (window.innerWidth <= 1024) {
            setMenuOpened(false);
        }
    };

    return (
        <ScrollArea
            className={cn('relative h-screen border-r pt-16 lg:block w-72 max-w-72 overflow-auto transition-all z-20 sidebarmenu')}
            style={{ maxWidth: menuOpened ? '230px' : '0px', left: '-1px' }}
        >
            <div className='space-y-4 py-4'>
                <div className='pr-3 pl-1 py-2'>
                    <div className='space-y-1'>
                        <h2 className='mb-2 px-4 text-xl font-semibold tracking-tight'>
                        Overview
                        </h2>
                        <DashboardNav items={navItems} />
                    </div>
                    <MenubarSeparator />
                    <div className='h-full'>
                        <div className='space-y-1 mt-4'>
                            <h2 className='mb-2 px-4 text-xl font-semibold tracking-tight'>
                            Chess Matches
                            </h2>
                            {
                                chessGames.map(game => (
                                    <Link
                                        to={`/dashboard/${playerInfo.username}/${playerInfo.username === game.username1 ? game.username2 : game.username1}/${game.id}`}
                                        key={game.id}
                                        onClick={handleCloseMenu}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger className='block w-full text-start'>
                                                    <div
                                                        className={cn(
                                                            'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground truncate gap-2'
                                                        )}
                                                        style={{ backgroundColor: (username === game.username1 || username === game.username2) && '#222' }}
                                                    >
                                                        <Avatar className='w-8 h-8 relative overflow-visible'>
                                                            <AvatarFallback 
                                                                style={{ 
                                                                    backgroundColor: stringToColor(playerInfo.username === game.username1 ? game.username2[0] : game.username1[0]),
                                                                    border: '1px solid #fff'
                                                                }}
                                                            >
                                                                {playerInfo.username === game.username1 ? game.username2[0] : game.username1[0]}
                                                            </AvatarFallback>
                                                            {
                                                                playerInfo.username === game.username1 ? 
                                                                    (onlineUsersIds[game.userId2] && <div className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-500'></div>) : 
                                                                    (onlineUsersIds[game.userId1] && <div className='absolute bottom-0 right-0 w-3 h-3 rounded-full bg-lime-500'></div>)
                                                            }
                                                        </Avatar>
                                                        <div>
                                                            <div>
                                                                {playerInfo.username === game.username1 ? game.username2 : game.username1} {' '}
                                                            </div>
                                                            <div className='text-[10px] p-0 m-0' style={{ lineHeight: '8px', fontWeight: '300' }}>
                                                                { game.gameStarted ? 'Game Started' : (game.matchRequestMade && 'Match Request') }
                                                                { (game.gameStarted && chessBoardRoomsInstances[game.id]?.turnOfPlay) &&
                                                                    (chessBoardRoomsInstances[game.id] && chessBoardRoomsInstances[game.id]?.turnOfPlay === 'black' ? 
                                                                        (game.blackPieceUser === playerInfo.id ? ' • Your Turn' : ' • Waiting') :
                                                                        (game.whitePieceUser === playerInfo.id ? ' • Your Turn' : ' • Waiting')
                                                                    )  
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                { (game.gameStarted || game.matchRequestMade) && (
                                                    <TooltipContent>
                                                        {game.gameStarted && (<span className='text-lime-400'>(Game Started)</span>)}
                                                        {game.matchRequestMade && (<span className='text-teal-500'>(Request Made)</span>)}
                                                    </TooltipContent>
                                                ) }  
                                            </Tooltip>
                                        </TooltipProvider>
                                    </Link>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}
