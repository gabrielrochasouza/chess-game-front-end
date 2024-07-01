import {useParams} from 'react-router-dom';
import Layout from '@/components/layout';
import ChessBoard from '@/components/ChessBoard';
import { useEffect, useState } from 'react';
import { socket } from '@/socket-client/socket';
// import { colorType } from '@/models/types';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { useUsers } from '@/provider/users';
import { getRoomInfo, getUserByUsername, saveChat } from '@/api';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IChatMessage {
    roomId: string,
    message: string,
    username: string,
    createdAt: string,
}

interface IUser {
    id: string,
    username: string,
    profilePic: string,
    createdAt: string,
    updatedAt: string,
    wins:number,
    loses:number,
    draws:number,
}

const Room = ()=> {
    // const [, setRoom] = useState();
    // const [sender, setSender] = useState<string>();
    // const [chessPieceSide, setChessPieceSide] = useState<colorType>();
    const { roomId, username } = useParams();
    const { onlineUsers, playerInfo } = useUsers();
    const [message, setMessage] = useState<string>('');

    const [chatMessages, setChatMessages] = useState<IChatMessage[]>([]);
    const [playerAdversary, setPlayerInfo] = useState<IUser>({} as IUser);

    const playerIsOnline = onlineUsers.includes(playerAdversary?.id);

    const sendChatMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket.emit('sendChatMessage', { message: message, roomId, username: playerInfo.username });
        setMessage('');
    };

    const getMessages = () => {
        getRoomInfo(roomId).then(({data}) => {
            if (data.id === roomId) {
                setChatMessages(JSON.parse(data.chatMessages));
            }
        });
    };

    useEffect(()=> {
        socket.on('chatMessage', (payload) => {
            console.log('socket chatMessage');
            if (roomId === payload.roomId && JSON.stringify(payload.chatMessages[payload.roomId])) {
                saveChat(payload.roomId, JSON.stringify(payload.chatMessages[payload.roomId]))
                    .then(() => getMessages());
                // setChatMessages(payload.chatMessages[payload.roomId]);
            }
        });

        socket.emit('joinRoom', roomId);

        getMessages();

        getUserByUsername(username).then(({data}) => {
            setPlayerInfo(data);
        });
        return () => {
            socket.off('joinedRoom');
        };
    }, [roomId, username]);

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
                                {username}
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
                                    {playerAdversary?.profilePic && (
                                        <AvatarImage src={playerAdversary?.profilePic} className='object-cover' />
                                    )}
                                    <AvatarFallback>{username ? username[0] : ''}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-base font-bold tracking-tight leading-none">
                                        {username}
                                    </h2>
                                    <span className='text-xs leading-none'>{playerIsOnline ? '🟢 Online' : 'Offline'}</span>
                                </div>
                            </div>
                            <Separator className="my-2" />
                            <ScrollArea className='flex flex-1 flex-col justify-end p-4 min-w-40 gap-2 overflow-auto text-xs'>
                                <div>
                                    {chatMessages.map(chat => (
                                        <div key={new Date(chat.createdAt).valueOf()} className={chat.username === playerInfo.username ? 'text-start my-2' : 'text-end my-2'}>
                                            <div className={chat.username === playerInfo.username ? 'chess-chat-message-sent' : 'chess-chat-message-from'}>
                                                {chat.message}
                                                <div className='absolute bottom-0 right-2' style={{ fontSize: '8px' }}>
                                                    {new Date(chat.createdAt).toLocaleTimeString().slice(0,-3)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <Separator />
                            <div className='flex min-h-10 justify-center items-center py-4'>
                                <form onSubmit={sendChatMessage} className="flex w-full items-center space-x-2 px-4">
                                    <Input className='min-w-40' value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Send Message" />
                                    <Button disabled={!message} type='submit'>
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