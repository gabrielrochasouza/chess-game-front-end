import Header from '@/components/layout/header';
import Sidebar from '@/components/layout/sidebar';
import { ScrollArea } from '@radix-ui/react-scroll-area';

const Layout = ({
    children,
}: {
    children: React.ReactNode;
  })=> {
    return (
        <ScrollArea className='h-full'>
            <Header />
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <main className="w-full pt-14 overflow-auto">
                    <ScrollArea className="h-full">
                        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                            {children}
                        </div>
                    </ScrollArea>
                </main>
            </div>
        </ScrollArea>
    );
};

export default Layout;