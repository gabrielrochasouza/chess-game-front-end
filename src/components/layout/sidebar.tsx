import { DashboardNav } from '@/components/dashboard-nav';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';


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
                </div>
            </div>
        </nav>
    );
}
