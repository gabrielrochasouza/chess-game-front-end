import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import  React, { useState } from 'react';
import { executeLogin, registerUser } from '@/api';
import { ReloadIcon } from '@radix-ui/react-icons';

const Register = ()=> {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    
    if (localStorage.getItem('@Token')) {
        return <Navigate to={'/'} />;
    }

    const submitRegisterForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        const user = await registerUser({
            username,
            password,
        });

        if (user) {
            const loginResponse = await executeLogin({ username, password });
            if (loginResponse) {
                navigate('/');
            }
        }
        setLoading(false);
    };

    const buttonDisabled = !(username && password && confirmPassword && password === confirmPassword && !loading);

    return (
        <ScrollArea className='h-full h-lvh flex justify-center items-center'>
            <form onSubmit={submitRegisterForm}>
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>Create an account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Username</Label>
                                <Input id="name" onChange={(event) => setUsername(event.target.value)} required placeholder="Your username" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" onChange={(event) => setPassword(event.target.value)} minLength={8} required type='password' placeholder="Password" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Confirm Password</Label>
                                <Input id="confirmPassword" onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required type='password' placeholder="Password" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button variant="default" disabled={buttonDisabled}>
                            {loading && <ReloadIcon className="mr-2 animate-spin" />}
                            Create
                        </Button>
                        <Link to='/login'>
                            <Button type='submit' variant="secondary">
                            Already have an account
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </form>
        </ScrollArea>
    );
};

export default Register;
