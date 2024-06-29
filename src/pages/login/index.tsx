import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { executeLogin } from '@/api';

const Login = ()=> {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    if (localStorage.getItem('@Token')) {
        // Fazer chamada de API para verificar se token é válido
        return <Navigate to={'/'} />
    }

    const submitLoginForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const loginResponse = await executeLogin({ username, password });
        if (loginResponse) {
            localStorage.setItem('@UserInfo', JSON.stringify(loginResponse));
            navigate('/')
        }
    };

    return (
        <ScrollArea className='h-full h-lvh flex justify-center items-center align-center'>
            <form onSubmit={submitLoginForm}>
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Make your login.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Username</Label>
                                <Input id="name" onChange={(event) => setUsername(event.target.value)} placeholder="Your username" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" onChange={(event) => setPassword(event.target.value)} type='password' minLength={8} placeholder="Password" required />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button type='submit' variant="default">Enter</Button>
                        <Link to='/register'>
                            <Button variant="secondary">
                            Create an account
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </form>
        </ScrollArea>
    )
};

export default Login;
