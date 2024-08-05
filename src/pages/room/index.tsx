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
import { ChevronRight, SendHorizonal } from 'lucide-react';
import { useUsers } from '@/provider/users';
import { declineRequest, getRoomInfo, increaseLoseCounter, sendChessMatchRequest, startMatch } from '@/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChessBoard as ChessBoardClass } from '@/models/ChessBoard';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { colorType } from '@/models/types';
import LoadingBar from 'react-top-loading-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { ReloadIcon, ChatBubbleIcon } from '@radix-ui/react-icons';
import { IChessGames } from '@/types/chess-game.types';
import { IUserInfo } from '@/types/users.types';
import { formatDateTime } from '@/utils';
// import NewNotification from '@/assets/sound/new-notification.mp3';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';


const STATUS_NO_MATCH_REQUEST = 0;
const STATUS_MATCH_REQUEST_MADE_BY_ME = 1;
const STATUS_MATCH_REQUEST_MADE_BY_OPPONENT = 2;
const STATUS_GAME_STARTED = 3;

type IGameStatus = 0 | 1 | 2 | 3;

const Room = ()=> {
    // ============================================
    // context variables
    // ============================================
    const { 
        onlineUsers,
        playerInfo,
        chessBoardRoomsInstances,
        chatMessagesRooms,
        setChessBoardRoomsInstances,
        sendChatMessageToRoom,
        setChatMessagesRooms,
        chessGames,
        setChessGames,
        reloadPersonalInfo,
    } = useUsers();
    
    // ============================================
    // URL params
    // ============================================
    const { roomId, username, personalUsername } = useParams();

    // ============================================
    // UseState variables
    // ============================================
    const [message, setMessage] = useState<string>('');
    const [playerAdversary, setPlayerAdversary] = useState<IUserInfo>({} as IUserInfo);
    const [playerColorSide, setPlayerColorSide] = useState<colorType>();
    const [progress, setProgress] = useState(40);
    const [loaded, setLoaded] = useState(false);
    const [gameStatus, setGameStatus] = useState<IGameStatus>(0);
    const [loadingMatchRequestEvent, setLoadingMatchRequestEvent] = useState(false);
    const [loadingStartMatchRequestEvent, setLoadingStartMatchRequestEvent] = useState(false);
    const [loadingDeclineEvent, setLoadingDeclineEvent] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // ============================================
    // Useful variables
    // ============================================
    const currentGame = chessGames.find(game => game.id === roomId);
    const playerAdversaryId = currentGame?.username1 === username ? currentGame?.userId1 : currentGame?.userId2;    
    const playerIsOnline =  onlineUsers.includes(playerAdversaryId);
    const chatMessagesAlreadyLoaded = chatMessagesRooms[roomId]?.length && chatMessagesRooms[roomId];
    const navigate = useNavigate();

    // ============================================
    // Load room data (HTTP request)
    // ============================================
    const getRoomData = () => {
        getRoomInfo(roomId).then(({data}: {data: IChessGames}) => {
            setLoaded(false);
            setProgress(60);
            setChatMessagesRooms({ ...chatMessagesRooms, [roomId]: JSON.parse(data.chatMessages)});

            const colorSide = data.whitePieceUser === playerInfo.id ? 'white' : 'black';
            setPlayerColorSide(colorSide);

            setPlayerAdversary(username === data.user1.username ? data.user1 : data.user2);
            
            updateRoomStatus(data);

        }).catch(() => {
            navigate('/dashboard');
        }).finally(() => {
            setProgress(100);
            setLoaded(true);
        });
    };

    // ============================================
    // Handle events (HTTP request)
    // ============================================
    const handleStartGame = () => {
        setLoadingStartMatchRequestEvent(true);
        startMatch(roomId).then(({data}: {data: IChessGames}) => {
            setGameStatus(STATUS_GAME_STARTED);
            setPlayerColorSide(data.whitePieceUser === playerInfo.id ? 'white' : 'black');

            const colorSide = data.whitePieceUser === playerInfo.id ? 'white' : 'black';
            setPlayerColorSide(colorSide);

            socket.emit('reloadInfo', { userId: playerAdversary.id, username: personalUsername, status: STATUS_GAME_STARTED, roomId });
            toast.success('Game started');

            updateChessGamesStatus(STATUS_GAME_STARTED);
            chessBoardRoomsInstances[roomId].startGame();
        }).finally(() => {
            setLoadingStartMatchRequestEvent(false);
        });
    };

    const handleMatchRequest = () => {
        setLoadingMatchRequestEvent(true);
        sendChessMatchRequest(roomId).then(() => {
            socket.emit('reloadInfo', { userId: playerAdversary.id, username: personalUsername, status: STATUS_MATCH_REQUEST_MADE_BY_ME, roomId });
            setGameStatus(STATUS_MATCH_REQUEST_MADE_BY_ME);
            getRoomData();
            toast.success('Chess Request Made');

            updateChessGamesStatus(STATUS_MATCH_REQUEST_MADE_BY_ME);
            chessBoardRoomsInstances[roomId].startGame();
        }).finally(() => {
            setLoadingMatchRequestEvent(false);
        });
    };

    const handleDecline = () => {
        setLoadingDeclineEvent(true);
        declineRequest(roomId).then(() => {
            socket.emit('reloadInfo', { userId: playerAdversary.id, username: personalUsername, status: STATUS_NO_MATCH_REQUEST, roomId });
            setGameStatus(STATUS_NO_MATCH_REQUEST);
            getRoomData();

            updateChessGamesStatus(STATUS_NO_MATCH_REQUEST);
            chessBoardRoomsInstances[roomId].startGame();
        }).finally(() => {
            setLoadingDeclineEvent(false);
        });
    };

    const handleEndGame = () => {
        setLoadingDeclineEvent(true);
        declineRequest(roomId).then(async () => {
            if (playerIsOnline) {
                await increaseLoseCounter();
                toast.error('You gave up');
                socket.emit('player-gave-up', { userId: playerAdversaryId });
            }
            socket.emit('reloadInfo', { userId: playerAdversary.id, username: personalUsername, status: STATUS_NO_MATCH_REQUEST, roomId });
            setGameStatus(STATUS_NO_MATCH_REQUEST);
            getRoomData();

            updateChessGamesStatus(STATUS_NO_MATCH_REQUEST);
            chessBoardRoomsInstances[roomId].startGame();
        }).finally(() => {
            setLoadingDeclineEvent(false);
        });
    };

    // ============================================
    // Useful functions
    // ============================================
    const updateRoomStatus = (data: IChessGames) => {
        if (data.gameStarted) {
            setGameStatus(STATUS_GAME_STARTED);
        }
        if (data.matchRequestMade && data.userIdOfRequest === playerInfo.id) {
            setGameStatus(STATUS_MATCH_REQUEST_MADE_BY_ME);
        }
        if (data.matchRequestMade && data.userIdOfRequest !== playerInfo.id) {
            setGameStatus(STATUS_MATCH_REQUEST_MADE_BY_OPPONENT);
        }
        if (!data.gameStarted && !data.matchRequestMade) {
            setGameStatus(STATUS_NO_MATCH_REQUEST);
        }
    };

    const updateChessGamesStatus = (status: IGameStatus) => {
        const currentGameIndex = chessGames.findIndex(game => game.id === roomId);
        const userId = localStorage.getItem('@UserId') || playerInfo.id;

        if (currentGameIndex !== -1) {
            switch (status) {
            case STATUS_GAME_STARTED:
                chessGames[currentGameIndex].gameStarted = true;
                chessGames[currentGameIndex].matchRequestMade = false;
                chessGames[currentGameIndex].userIdOfRequest = null;
                break;
            case STATUS_MATCH_REQUEST_MADE_BY_ME:
                chessGames[currentGameIndex].gameStarted = false;
                chessGames[currentGameIndex].matchRequestMade = true;
                chessGames[currentGameIndex].userIdOfRequest = userId;
                break;
            case STATUS_NO_MATCH_REQUEST:
                chessGames[currentGameIndex].gameStarted = false;
                chessGames[currentGameIndex].matchRequestMade = false;
                chessGames[currentGameIndex].userIdOfRequest = null;
            }
        }
        setChessGames(chessGames);
    };

    // ============================================
    // Chat functions
    // ============================================
    const sendChatMessage = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendChatMessageToRoom({message, roomId, username: playerInfo.username, targetUserId: playerAdversaryId});
        setMessage('');
    };

    const scrollChatToBottom = () => {
        const scrollArea = document.getElementById('scroll-area');
        if (scrollArea) {
            const div = scrollArea.querySelector('div');
            div.scrollTo({ left: 0, top: div.scrollHeight, behavior: 'smooth' });
        }
    };

    if (!chessBoardRoomsInstances[roomId] && playerColorSide) {
        setChessBoardRoomsInstances({ ...chessBoardRoomsInstances, [roomId]: new ChessBoardClass(roomId, playerColorSide) });
    }

    // ============================================
    // UseEffects events
    // ============================================
    useEffect(()=> {
        socket.on('chatMessage', (payload: { roomId: string, username: string, chatMessages: { [key: string]:{roomId: string, message: string, username: string, createdAt: Date }[] } }) => {
            if (payload.username === username) {
                const updatedChatMessages = { ...chatMessagesRooms, [roomId]: payload.chatMessages[payload.roomId]};
                if (updatedChatMessages) {
                    setChatMessagesRooms(updatedChatMessages);
                }
            }
        });
        socket.on('reloadInfo', (payload: { userId: string }) => {
            const playerId = localStorage.getItem('@UserId') || playerInfo.id;
            if (payload.userId === playerId) {
                getRoomData();
            }
        });
        socket.on('update-room', (payload: { roomId: string, result: number }) => {
            if (payload.roomId === roomId) {
                declineRequest(roomId).then(() => {
                    setGameStatus(STATUS_NO_MATCH_REQUEST);
                    updateChessGamesStatus(STATUS_NO_MATCH_REQUEST);
                    setChessBoardRoomsInstances({ ...chessBoardRoomsInstances, [roomId]: new ChessBoardClass(roomId, playerColorSide) });
                    reloadPersonalInfo();
                    chessBoardRoomsInstances[roomId].startGame();
                });
            }
        });

        setLoaded(false);
        
        socket.emit('joinRoom', roomId);
        
        getRoomData();
        
        scrollChatToBottom();

        return () => {
            socket.off('chatMessage');
            socket.off('reloadInfo');
            socket.off('update-room');
        };
    }, [roomId, username]);

    useEffect(() => {
        scrollChatToBottom();
    }, [chatMessagesRooms]);

    useEffect(() => {
        const currentChessGame = chessGames.find(game => game.id === roomId);

        if (currentChessGame) {
            updateRoomStatus(currentChessGame);
        }

    }, [chessGames]); 

    return (
        <>
            <LoadingBar color='#f11946' progress={progress} onLoaderFinished={() => setProgress(0)} />
            <Layout noPadding>
                <ResizablePanelGroup
                    direction='horizontal'
                    className='h-full h-lvh'
                >
                    <ResizablePanel defaultSize={50} className={showChat ? 'p-4 md:p-8 relative transition-all hide-column' : 'p-4 md:p-8 relative transition-all show-chat'}>
                        {/* ******************************* BreadCrumb ******************************* */}
                        <Breadcrumb className='mb-8'>
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
                        {!showChat && (
                            <Button variant='default' className='absolute top-4 right-6 rounded-full p-0 w-8 h-8 hide-laptop' onClick={() => setShowChat(true)}>
                                <ChatBubbleIcon />
                            </Button>
                        )}
                        {/* ******************************* Main Part ******************************* */}
                        {loaded ? (
                            <>
                                {gameStatus === STATUS_NO_MATCH_REQUEST && (
                                    <Card className='p-4 mt-0'>
                                        <CardHeader className='pl-0'>
                                            <CardTitle>Request a chess match with '{username}'</CardTitle>
                                            <CardDescription>{playerIsOnline ? 'Player is online available to play' : 'Player is not online available to play'}</CardDescription>
                                        </CardHeader>
                                        <Button disabled={loadingMatchRequestEvent} variant='secondary' onClick={() => handleMatchRequest()}>
                                            {loadingMatchRequestEvent && <ReloadIcon className='mr-2 animate-spin' />}
                                            Request Match
                                        </Button>
                                    </Card>
                                )}
                                {gameStatus === STATUS_MATCH_REQUEST_MADE_BY_ME && (
                                    <Card className='p-4 mt-0'>
                                        <CardHeader className='pl-0'>
                                            <CardTitle>You made a request to '{username}'</CardTitle>
                                            <CardDescription>{playerIsOnline ? 'Player is online available to play' : 'Player is not online available to play'}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                )}
                                {gameStatus === STATUS_MATCH_REQUEST_MADE_BY_OPPONENT && (
                                    <Card className='p-4 mt-0'>
                                        <CardHeader className='pl-0'>
                                            <CardTitle>The user '{username}' made a match request for you</CardTitle>
                                            <CardDescription>{playerIsOnline ? 'Player is online available to play' : 'Player is not online available to play'}</CardDescription>
                                        </CardHeader>
                                        <Button className='ml-0' disabled={!playerIsOnline || loadingStartMatchRequestEvent} onClick={() => handleStartGame()}>
                                            {loadingStartMatchRequestEvent && <ReloadIcon className='mr-2 animate-spin' />}
                                            Start Game
                                        </Button>
                                        <Button variant='destructive' className='ml-4' disabled={loadingDeclineEvent} onClick={() => handleDecline()}>
                                            {loadingDeclineEvent && <ReloadIcon className='mr-2 animate-spin' />}
                                            Decline
                                        </Button>
                                    </Card>
                                )}
                                {gameStatus === STATUS_GAME_STARTED && (
                                    <ScrollArea className='p-0 mt-0 h-full w-full'>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant='destructive' className='ml-0' disabled={loadingDeclineEvent}>
                                                    {loadingDeclineEvent && <ReloadIcon className='mr-2 animate-spin' />} { playerIsOnline ? 'Give Up' : 'End Game' }
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className='sm:max-w-[355px] w-80'>
                                                <DialogHeader>
                                                    <DialogTitle className='text-2xl'>{ playerIsOnline ? 'Give Up' : 'End Game' }</DialogTitle>
                                                    <DialogDescription>You will end the match</DialogDescription>
                                                </DialogHeader>
                                                <div className='py-4'>Are you sure you want to continue?</div>
                                                <DialogFooter className='gap-2'>
                                                    <DialogClose asChild>
                                                        <Button type='submit' variant='default'>Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button variant='destructive' className='ml-0' disabled={loadingDeclineEvent} onClick={() => handleEndGame()}>
                                                            {loadingDeclineEvent && <ReloadIcon className='mr-2 animate-spin' />} { playerIsOnline ? 'Give Up' : 'End Game' }
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                        {chessBoardRoomsInstances[roomId] && <ChessBoard chessPieceSide={playerColorSide} chessBoardInstance={chessBoardRoomsInstances[roomId]} playerIsOnline={playerIsOnline} playerAdversaryId={playerAdversaryId} />}
                                    </ScrollArea>
                                )}
                            </>
                        ) : (
                            // ******************************* Skeleton Loader *******************************
                            <Card className='flex flex-col space-y-3 w-full mt-0 p-4 pt-10'>
                                <Skeleton className='h-[30px] w-80 rounded-xl' />
                                <Skeleton className='h-[20px] w-full rounded-xl' />
                                <div className='space-y-0 gap-4 flex items-center'>
                                    <Skeleton className='h-[40px] w-32' />
                                </div>
                            </Card>
                        )}
                    </ResizablePanel>
                    <ResizableHandle />
                    {/* ******************************* Side Chat message ******************************* */}
                    <ResizablePanel defaultSize={40} className={showChat ? 'relative transition-all show-chat' : 'max-w-md relative transition-all hide-column'}>
                        <Button variant='ghost' className='absolute top-6 right-6 rounded-full p-0 w-8 h-8 hide-laptop' onClick={() => setShowChat(false)}>
                            <ChevronRight />
                        </Button>
                        <ResizablePanelGroup direction='vertical'>
                            <ResizablePanel defaultSize={15} className='h-full flex flex-col'>
                                <div className='flex p-6 pb-2 gap-4'>
                                    {(playerAdversary?.profilePic && loaded) ? (
                                        <Avatar>
                                            <AvatarImage src={playerAdversary?.profilePic} className='object-cover' />
                                            <AvatarFallback>{username ? username[0] : ''}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Skeleton className='h-10 w-10 rounded-full' />
                                    )}
                                    <div>
                                        <h2 className='text-base font-bold tracking-tight leading-none'>
                                            {username}
                                        </h2>
                                        <span className='text-xs leading-none'>{playerIsOnline ? '🟢 Online' : 'Offline'}</span>
                                    </div>
                                </div>
                                <Separator className='mt-2' />
                                <ScrollArea id='scroll-area' className='flex flex-1 flex-col justify-end px-4 min-w-40 gap-2 overflow-auto text-xs'>
                                    {(!loaded && !chatMessagesAlreadyLoaded) ? <p className='py-4'>Loading...</p> : ('') }
                                    {(chatMessagesAlreadyLoaded) ? chatMessagesRooms[roomId].map(chat => (
                                        <div key={new Date(chat.createdAt).valueOf()} className={chat.username === playerInfo.username ? 'text-start my-2' : 'text-end my-2'}>
                                            <div className={chat.username === playerInfo.username ? 'chess-chat-message-sent' : 'chess-chat-message-from'}>
                                                <div className='absolute top-1 left-2' style={{ fontSize: '9px' }}>{chat.username}</div>
                                                <div className='mt-4'>{chat.message}</div>
                                                <div className='absolute bottom-0 right-2' style={{ fontSize: '8px' }}>
                                                    {formatDateTime(chat.createdAt.toString())}
                                                </div>
                                            </div>
                                        </div>
                                    )) : ( loaded ? <p className='py-4'>No messages yet.</p> : '' )}
                                </ScrollArea>
                                <Separator />
                                <div className='flex min-h-10 justify-center items-center py-4'>
                                    <form onSubmit={sendChatMessage} className='flex w-full items-center space-x-2 px-4'>
                                        <Input className='min-w-40' value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Send Message' />
                                        <Button disabled={!message || !loaded} type='submit'>
                                            { loaded ? <SendHorizonal className='w-4' /> : <ReloadIcon className='animate-spin' /> }
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