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
import { Separator } from '@/components/ui/separator';


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
        <Layout>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink>
                            <Link to={'/dashboard'}>Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink>
                            Room
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink className='text-white'>
                            {roomId}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <Separator />
            <ChessBoard chessPieceSide={chessPieceSide} />
        </Layout>
    );
};

export default Room;