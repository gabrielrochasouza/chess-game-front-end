import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@radix-ui/react-scroll-area';

const Layout = ({
    children,
    noPadding=false,
}: {
    children: React.ReactNode;
    noPadding?: boolean;
  })=> {
    return (
        <ScrollArea className='h-full'>
            <Header />
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="w-full pt-14 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className={`flex-1 h-full space-y-4 p-${noPadding ? '0' : '4'} md:p-${noPadding ? '0' : '8'} pt-${noPadding ? '0' : '6'}`}>
                            {children}
                        </div>
                    </ScrollArea>
                </main>
            </div>
        </ScrollArea>
    );
};

export default Layout;