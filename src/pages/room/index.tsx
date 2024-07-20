import {useNavigate, useParams} from 'react-router-dom';
import Layout from '@/components/layout';
import ChessBoard from '@/components/ChessBoard';
import { useEffect, useState } from 'react';
import { socket } from '@/socket-client/socket';
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
import { getRoomInfo, startMatch } from '@/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChessBoard as ChessBoardClass } from '@/models/ChessBoard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { colorType } from '@/models/types';
import LoadingBar from 'react-top-loading-bar';

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

interface IRoomData {
    id: string,
    userId1: string,
    userId2: string,
    username1: string,
    username2: string,
    blackPieceUser?: string,
    whitePieceUser?: string,
    chatMessages: string,    
    matchRequestMade: boolean,
    gameStarted: boolean,
    createdAt: string,
    updatedAt: string,
    user1: IUser,
    user2: IUser,
}

const Room = ()=> {
    const { 
        onlineUsers,
        playerInfo,
        chessBoardRoomsInstances,
        chatMessagesRooms,
        setChessBoardRoomsInstances,
        sendChatMessageToRoom,
        setChatMessagesRooms,
    } = useUsers();
    const navigate = useNavigate();
    const { roomId, username, personalUsername } = useParams();
    const [message, setMessage] = useState<string>('');
    const [playerAdversary, setPlayerInfo] = useState<IUser>({} as IUser);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [playerColorSide, setPlayerColorSide] = useState<colorType>();
    const [progress, setProgress] = useState(40);
    const [loaded, setLoaded] = useState(false);

    const playerIsOnline = onlineUsers.includes(playerAdversary?.id);

    const sendChatMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendChatMessageToRoom({message, roomId, username: playerInfo.username});
        setMessage('');
    };

    const scrollChatToBottom = () => {
        const scrollArea = document.getElementById('scroll-area');
        if (scrollArea) {
            const div = scrollArea.querySelector('div');
            div.scrollTo({ left: 0, top: div.scrollHeight, behavior: 'smooth' });
        }
    };

    const getRoomData = () => {
        getRoomInfo(roomId).then(({data}: {data: IRoomData}) => {
            setLoaded(false);
            setProgress(60);
            setChatMessagesRooms({ ...chatMessagesRooms, [roomId]: JSON.parse(data.chatMessages)});
            setGameStarted(data.gameStarted);
            setPlayerColorSide(data.whitePieceUser === playerInfo.id ? 'white' : 'black');
            setPlayerInfo(username === data.user1.username ? data.user1 : data.user2);
        }).catch(() => {
            navigate('/dashboard');
        }).finally(() => {
            setProgress(100);
            setLoaded(true);
        });
    };

    const handleStartGame = () => {
        startMatch(roomId).then(({data}: {data: IRoomData}) => {
            setGameStarted(data.gameStarted);
            setPlayerColorSide(data.whitePieceUser === playerInfo.id ? 'white' : 'black');
            socket.emit('reloadInfo', { userId: playerAdversary.id });
        });
    };

    if (!chessBoardRoomsInstances[roomId]) {
        setChessBoardRoomsInstances({ ...chessBoardRoomsInstances, [roomId]: new ChessBoardClass() });
    }

    const formatDatetime = (createdAt: Date) => {
        const dateInstance = new Date(createdAt);
        const time = dateInstance.toLocaleTimeString().slice(0, -3);
        const date = dateInstance.toLocaleDateString();
        if (date === new Date().toLocaleDateString()) {
            return `Hoje ${time}`;
        }
        return `${date} ${time}`;
    };

    useEffect(()=> {
        socket.on('chatMessage', (payload: { roomId: string, username: string, chatMessages: { [key: string]:{roomId: string, message: string, username: string, createdAt: Date }[] } }) => {
            if (payload.username === username) {
                const updatedChatMessages = { ...chatMessagesRooms, [roomId]: payload.chatMessages[payload.roomId]};
                if (updatedChatMessages) {
                    setChatMessagesRooms(updatedChatMessages);
                }
            }
        });

        socket.emit('joinRoom', roomId);

        getRoomData();

        return () => {
            socket.off('chatMessage');
        };
    }, [roomId, username]);

    useEffect(() => {
        scrollChatToBottom();
    }, [chatMessagesRooms]);


    return (
        <>
            <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
            <Layout noPadding>
                <ResizablePanelGroup
                    direction='horizontal'
                    className='h-full h-lvh'
                >
                    <ResizablePanel defaultSize={50} className='p-4 md:p-8'>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <Link to={'/dashboard'}>Dashboard</Link>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {personalUsername}
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink className='text-white'>
                                        {username}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        {gameStarted ? (
                            <div className='p-4 mt-8'>
                                {chessBoardRoomsInstances[roomId] && <ChessBoard chessPieceSide={playerColorSide} chessBoardInstance={chessBoardRoomsInstances[roomId]} />}
                            </div>
                        ) : (
                            <Card className='p-4 mt-8'>
                                <CardHeader className='pl-0'>
                                    <CardTitle>Request a chess match with '{username}'</CardTitle>
                                    <CardDescription>{playerIsOnline ? 'Player is online available to play' : 'Player is not online available to play'}</CardDescription>
                                </CardHeader>
                                <Button variant='secondary' onClick={() => setGameStarted(true)}>Request Match</Button>
                                <Button className='ml-4' disabled={!playerIsOnline} onClick={() => handleStartGame()}>Start Game</Button>
                            </Card>
                        )}
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={40} className='max-w-md'>
                        <ResizablePanelGroup direction='vertical'>
                            <ResizablePanel defaultSize={15} className='h-full flex flex-col'>
                                <div className='flex p-6 pb-2 gap-4'>
                                    <Avatar>
                                        {playerAdversary?.profilePic && (
                                            <AvatarImage src={playerAdversary?.profilePic} className='object-cover' />
                                        )}
                                        <AvatarFallback>{username ? username[0] : ''}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className='text-base font-bold tracking-tight leading-none'>
                                            {username}
                                        </h2>
                                        <span className='text-xs leading-none'>{playerIsOnline ? '🟢 Online' : 'Offline'}</span>
                                    </div>
                                </div>
                                <Separator className='my-2' />
                                <ScrollArea id='scroll-area' className='flex flex-1 flex-col justify-end p-4 min-w-40 gap-2 overflow-auto text-xs'>
                                    { !loaded && <p>Loading...</p> }
                                    {(chatMessagesRooms[roomId] && Array.isArray(chatMessagesRooms[roomId]) && loaded) && chatMessagesRooms[roomId].map(chat => (
                                        <div key={new Date(chat.createdAt).valueOf()} className={chat.username === playerInfo.username ? 'text-start my-2' : 'text-end my-2'}>
                                            <div className={chat.username === playerInfo.username ? 'chess-chat-message-sent' : 'chess-chat-message-from'}>
                                                <div className='absolute top-1 left-2' style={{ fontSize: '9px' }}>{chat.username}</div>
                                                <div className='mt-4'>{chat.message}</div>
                                                <div className='absolute bottom-0 right-2' style={{ fontSize: '8px' }}>
                                                    {formatDatetime(chat.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                                <Separator />
                                <div className='flex min-h-10 justify-center items-center py-4'>
                                    <form onSubmit={sendChatMessage} className='flex w-full items-center space-x-2 px-4'>
                                        <Input className='min-w-40' value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Send Message' />
                                        <Button disabled={!message && loaded} type='submit'>
                                            <SendHorizonal className='w-4' />
                                        </Button>
                                    </form>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </Layout>
        </>
    );
};

export default Room;