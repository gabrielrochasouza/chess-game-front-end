import ChessBoard from '@/components/ChessBoard';
import Layout from '@/components/layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChessBoard as ChessBoardClass } from '@/models/ChessBoard';
import { Link } from 'react-router-dom';

const Bot = () => {
    
    const chessBoardInstance = new ChessBoardClass('bot', 'white');

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
            <ChessBoard
                chessPieceSide={'white'}
                playerIsOnline={true}
                playerAdversaryId={'bot'}
                chessBoardInstance={chessBoardInstance}
            />
        </Layout>
    );
};

export default Bot;