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
                    {children}
                </main>
            </div>
        </ScrollArea>
    )
}

export default Layout;