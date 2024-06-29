import {useParams} from 'react-router-dom';
import { validate as isValidUUID } from 'uuid';
import {Navigate} from 'react-router-dom';
import Layout from '@/components/layout';
import ChessBoard from '@/components/ChessBoard';
import { useEffect, useState } from 'react';
import { socket } from '@/socket-client/socket';
import { colorType } from '@/models/types';


const Room = ()=> {
    const [room, setRoom] = useState();
    const [sender, setSender] = useState<string>();
    const { roomId } = useParams();
    const [chessPieceSide, setChessPieceSide] = useState<colorType>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    if(!isValidUUID(roomId)) {
        return <Navigate to={'/'} />
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(()=> {
        socket.emit('joinRoom', roomId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.on('joinRoom', (roomInfo: any) => {
            const room = roomInfo.room;
            const currentRoom = room[roomId];
            if (currentRoom.length <= 2) {
                setRoom(roomInfo.room);
                console.log('sender', sender);
                if (!sender) {
                    setSender(roomInfo.sender)
                }
                if ( currentRoom && Array.isArray(currentRoom) && !chessPieceSide) {
                    const index = currentRoom.findIndex(r => r === roomInfo.sender);
                    setChessPieceSide(index === 1 ? 'black' : 'white');
                }
            }
        });
    }, [roomId])

    return (
        <Layout>
            {room && JSON.stringify(room[roomId])}
            <ChessBoard chessPieceSide={chessPieceSide} />
        </Layout>
    )
};

export default Room;