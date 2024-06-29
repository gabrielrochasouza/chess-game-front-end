import WhiteQueen from '@/assets/svg/white_queen.svg';
import { Link } from 'react-router-dom';
import * as Avatar from '@radix-ui/react-avatar';
import * as Menubar from '@radix-ui/react-menubar';
import { useUsers } from '@/provider/users';
import '../../../app/header-style.css';
import { LogOut, User } from 'lucide-react';

export default function Header() {
    const { playerInfo } = useUsers();

    return (
        <div className="fixed top-0 left-0 right-0 supports-backdrop-blur:bg-background/60 border-b bg-background/95 backdrop-blur z-20">
            <nav className="h-14 flex items-center justify-between px-4">
                <div className="hidden lg:block">
                    <Link to={'/'}>
                        <img src={WhiteQueen}/>
                    </Link>
                </div>
                <div className='mr-4'>
                    <Menubar.Root className='left-4'>
                        <Menubar.Menu>
                            <Menubar.Trigger className="MenubarTrigger">
                                <Avatar.Root className="AvatarRoot">
                                    <Avatar.Image
                                        className="AvatarImage"
                                        src={playerInfo?.profilePic}
                                        alt={playerInfo?.username}
                                    />
                                    <Avatar.Fallback className="AvatarFallback">
                                        {playerInfo?.username}
                                        
                                    </Avatar.Fallback>
                                </Avatar.Root>
                            </Menubar.Trigger>
                            <Menubar.Portal>
                                <Menubar.Content
                                    className="MenubarContent"
                                    align="start"
                                    sideOffset={5}
                                    alignOffset={-14}
                                >
                                    <Menubar.Item className="MenubarItem">
                                        User: {playerInfo?.username}
                                        <div className="RightSlot">
                                            <User />
                                        </div>
                                    </Menubar.Item>
                                    <Menubar.Separator className="MenubarSeparator" />
                                    <Menubar.Item className="MenubarItem">
                                        Logout
                                        <div className="RightSlot">
                                            <LogOut />
                                        </div>
                                    </Menubar.Item>
                                </Menubar.Content>
                            </Menubar.Portal>
                        </Menubar.Menu>
                    </Menubar.Root>
                </div>
            </nav>
        </div>
    );
}
