import { useEffect, useState } from 'react';
import BlackKnight from '../../assets/svg/black_knight.svg';
import WhiteKnight from '../../assets/svg/white_knight.svg';
import { colorType } from '../../models/types';
import ChessBoard from '../ChessBoard';
import { socket } from '../../socket-client/socket';


function ChessPieceChoice() {
    const [colorSelected, setColorSelected] = useState<string>(null);
    const selectPiece = (color: colorType) => {
        setColorSelected(color);
        socket.emit('connect', 'connected');
    };

    useEffect(() => {

        socket.on('connect', () => {
            console.log('connect:');
        });
        socket.on('disconnect', (payload) => {
            console.log('disconnect:', payload);
        });
    }, []);

    return (
        <>
            {colorSelected ? (
                <ChessBoard chessPieceSide={colorSelected as colorType} />
            ) :
                (
                    <div className="select-piece">
                        <h1>Choose</h1>
                        <div className="piece-container centralize">
                            <img className="disabled" src={BlackKnight} onClick={() => selectPiece('black')} alt="black pawn piece" />
                            <img src={WhiteKnight} onClick={() => selectPiece('white')} alt="white pawn piece" />
                        </div>
                    </div>
                )}
        </>
    );
}

export default ChessPieceChoice;