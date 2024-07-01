import { DashboardNav } from '@/components/dashboard-nav';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Link } from 'react-router-dom';
import { MenubarSeparator } from '@/components/ui/menubar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUsers } from '@/provider/users';


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
    const { chessGames, playerInfo } = useUsers();

    return (
        <nav
            className={cn('relative hidden h-screen border-r pt-16 lg:block w-72')}
        >
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
                        Overview
                        </h2>
                        <DashboardNav items={navItems} />
                    </div>
                    <MenubarSeparator />
                    <ScrollArea className='h-full'>
                        <div className="space-y-1 mt-4">
                            <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
                            Chess Matches
                            </h2>
                            {
                                chessGames.map(game => (
                                    <Link
                                        to={`/dashboard/${playerInfo.username === game.username1 ? game.username2 : game.username1}/${game.id}`}
                                        key={game.id}
                                    >
                                        <span
                                            className={cn(
                                                'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'
                                            )}
                                        >
                                            <span>{playerInfo.username === game.username1 ? game.username2 : game.username1}</span>
                                        </span>
                                    </Link>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </nav>
    );
}
