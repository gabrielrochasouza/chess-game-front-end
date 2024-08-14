import './index.css';

export default function Loader() {
    return (
        <div className='h-screen w-full flex justify-center items-center text-2xl'>
            <div className='text-center'>
                <div className='banter-loader'>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                    <div className='banter-loader__box'></div>
                </div>
            </div>
        </div>
    );
}
