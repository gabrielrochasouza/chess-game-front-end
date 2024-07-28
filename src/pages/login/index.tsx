import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { executeLogin } from '@/api';
import { ReloadIcon } from '@radix-ui/react-icons';
import ChessVideo from '@/assets/video/chess-video.mp4';

const Login = ()=> {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    if (localStorage.getItem('@Token')) {
        return <Navigate to={'/'} />;
    }

    const submitLoginForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const loginResponse = await executeLogin({ username, password });
        setLoading(false);
        if (loginResponse) {
            localStorage.setItem('@UserInfo', JSON.stringify(loginResponse));
            navigate('/');
        }
    };

    return (
        <ScrollArea className='h-full h-lvh flex justify-center items-center align-center'>
            <div className='flex-1 flex justify-center align-center'>
                <form onSubmit={submitLoginForm}>
                    <Card className='w-[350px]'>
                        <CardHeader className='text-center'>
                            <CardTitle>Login</CardTitle>
                            <CardDescription>Make your login.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='grid w-full items-center gap-4'>
                                <div className='flex flex-col space-y-1.5'>
                                    <Label htmlFor='name'>Username</Label>
                                    <Input id='name' onChange={(event) => setUsername(event.target.value)} placeholder='Your username' required />
                                </div>
                                <div className='flex flex-col space-y-1.5'>
                                    <Label htmlFor='password'>Password</Label>
                                    <Input id='password' onChange={(event) => setPassword(event.target.value)} type='password' minLength={8} placeholder='Password' required />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className='flex gap-4 flex-col flex-wrap'>
                            <Button type='submit' disabled={loading} variant='default' className='flex-1 w-full'>
                                {loading && <ReloadIcon className='mr-2 animate-spin' />} Enter
                            </Button>
                            <Link to='/register' className='w-full'>
                                <Button variant='outline' type='button' className='flex-1 w-full border-solid'>Create an account</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </form>
            </div>
            <div className='flex-1 h-full justify-center align-center hidden xl:flex relative'>
                <video autoPlay loop muted className='w-full h-full object-cover'>
                    <source src={ChessVideo} />
                </video>
                <div className='absolute top-0 left-0 w-full h-full' style={{ background: 'linear-gradient(90deg, #09090b, #09090ba3)' }}></div>
            </div>
        </ScrollArea>
    );
};

export default Login;
