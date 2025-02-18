import ChessBoard from '@/components/ChessBoard';
import Layout from '@/components/layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChessBoard as ChessBoardClass } from '@/models/ChessBoard';
import { Link } from 'react-router-dom';
import { useCallback, useState } from 'react';
import WhiteKing from '@/assets/svg/white_king.svg';
import BlackKing from '@/assets/svg/black_king.svg';
import { Button } from '@/components/ui/button';

const Bot = () => {
    const [color, setColor] = useState<'white' | 'black'>();
    const [chessBoardInstance, setChessBoardInstance] = useState<ChessBoardClass>();
    
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({} as undefined), []);

    const selectColorSide = (color: 'white' | 'black') => {
        const instance = new ChessBoardClass('bot', color);
        setColor(color);
        setChessBoardInstance(instance);

        if (color === 'black') {
            setTimeout(() => {
                instance.botMove();
                forceUpdate();
            }, 500);
        }
    };

    const restartGameHandler = () => {
        chessBoardInstance.startGame();
        setColor(null);
        setChessBoardInstance(null);
        forceUpdate();
    };

    return (
        <Layout>
            <Breadcrumb className='mb-8'>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link to={'/dashboard'}>Dashboard</Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink className='text-white'>
                            {'Play with bot'}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {
                color ? (
                    <div className='text-center'>
                        <ChessBoard
                            chessPieceSide={color}
                            playerIsOnline={true}
                            playerAdversaryId={'bot'}
                            chessBoardInstance={chessBoardInstance}
                        />
                        <Button className='mt-4' onClick={restartGameHandler}>Restart Game</Button>
                    </div>
                ) : (
                    <>
                        <div className='flex gap-4 items-center justify-center select-side'>
                            <img src={WhiteKing} alt='white king' className='pointer' onClick={() => selectColorSide('white')} />
                            <img src={BlackKing} alt='black king' className='pointer' onClick={() => selectColorSide('black')} />
                        </div>
                    </>
                )
            }
        </Layout>
    );
};

export default Bot;