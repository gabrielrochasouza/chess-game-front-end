import {useParams} from 'react-router-dom';
import Layout from '@/components/layout';
import ChessBoard from '@/components/ChessBoard';
import { useEffect, useState } from 'react';
import { socket } from '@/socket-client/socket';
import { colorType } from '@/models/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

const Room = ()=> {
    const [, setRoom] = useState();
    const [sender, setSender] = useState<string>();
    const { roomId } = useParams();
    const [chessPieceSide, setChessPieceSide] = useState<colorType>();

    useEffect(()=> {
        socket.emit('joinRoom', roomId);
        socket.on('joinRoom', (roomInfo) => {
            console.log('roomInfo', roomInfo);
            const room = roomInfo.room;
            const currentRoom = room[roomId];
            if (currentRoom.length <= 2) {
                setRoom(roomInfo.room);
                if (!sender) {
                    setSender(roomInfo.sender);
                }
                if ( currentRoom && Array.isArray(currentRoom) && !chessPieceSide) {
                    const index = currentRoom.findIndex(r => r === roomInfo.sender);
                    setChessPieceSide(index === 1 ? 'black' : 'white');
                }
            }
        });
    }, [roomId]);

    return (
        <Layout noPadding>
            <ResizablePanelGroup
                direction="horizontal"
                className="h-full h-lvh"
            >
                <ResizablePanel defaultSize={50} className='p-4 md:p-8'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <Link to={'/dashboard'}>Dashboard</Link>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                            Room
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-white'>
                                    {roomId}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <ChessBoard chessPieceSide={'white'} />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} className='max-w-md'>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={15} className='h-full flex flex-col'>
                            <div className="flex p-6 pb-2 gap-4">
                                <Avatar>
                                    {/* <AvatarImage src={playerInfo?.profilePic} className='object-cover' /> */}
                                    <AvatarFallback>G</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-base font-bold tracking-tight leading-none">
                                    Gabriel
                                    </h2>
                                    <span className='text-xs leading-none'>Offline</span>
                                </div>
                            </div>
                            <Separator className="my-2" />
                            <div className='flex flex-1 flex-col-reverse p-4 min-w-40'>
                                <div>No Messages Yet</div>
                            </div>
                            <Separator />
                            <div className='flex min-h-10 justify-center items-center py-4'>
                                <form className="flex w-full items-center space-x-2 px-4">
                                    <Input className='min-w-40' type="email" placeholder="Send Message" />
                                    <Button>
                                        <SendHorizonal className='w-4' />
                                    </Button>
                                </form>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </Layout>
    );
};

export default Room;