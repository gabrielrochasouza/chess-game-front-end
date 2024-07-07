import Layout from '@/components/layout';
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useUsers } from '@/provider/users';
import { deleteUser, updateProfile } from '@/api';
import { toast } from 'react-toastify';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Link, useNavigate } from 'react-router-dom';

const Profile = ()=> {
    const { playerInfo, setPlayerInfo } = useUsers();
    const [username, setUsername] = useState<string>(playerInfo.username);
    const [profilePic, setProfilePic] = useState<string>(playerInfo.profilePic);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    const navigate = useNavigate();

    const submitUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            setLoadingUpdate(true);
            const updatedProfile = await updateProfile(playerInfo.id, {
                username,
                profilePic,
            });
            setPlayerInfo(updatedProfile.data);
            toast.success('Profile Updated');
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoadingUpdate(false);
        }
    };

    const submitDeleteProfile = async () => {
        console.log('delete profile');
        try {
            setLoadingDelete(true);
            await deleteUser(playerInfo.id);
            toast.success('Profile Deleted');
            localStorage.clear();
            navigate('/login');
        } catch (e) {
            toast.error(e.message);
        } finally {
            setLoadingDelete(false);
        }
    };

    useEffect (() => {
        setUsername(playerInfo.username);
        setProfilePic(playerInfo.profilePic);
    }, [playerInfo]);

    const buttonDisabled = !(username && password === confirmPassword && !loadingUpdate);

    return (
        <Layout>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <Link to={'/dashboard'}>Dashboard</Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink className='text-white'>
                            Profile
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-3xl font-bold tracking-tight'>{playerInfo.username}'s Profile</h2>
                    <p className='text-sm text-muted-foreground'>Update profile</p>
                </div>
            </div>
            <Separator className='my-4' />
            <form onSubmit={submitUpdateProfile}>
                <div className='grid items-center gap-4 max-w-2xl'>
                    <div className='flex-col space-y-1.5'>
                        <Label htmlFor='name'>Username</Label>
                        <Input id='name' value={username} onChange={(event) => setUsername(event.target.value)} placeholder='Your username' required />
                    </div>
                    <div className='flex-col space-y-1.5'>
                        <Label htmlFor='password'>Profile Picture URL</Label>
                        <Input id='profilePic' value={profilePic} onChange={(event) => setProfilePic(event.target.value)} required type='url' placeholder='Profile Picture URL' />
                    </div>
                    <div className='flex-col space-y-1.5'>
                        <Label htmlFor='password'>New Password</Label>
                        <Input id='password' value={password} onChange={(event) => setPassword(event.target.value)} type='password' minLength={8} placeholder='Password' />
                    </div>
                    { password && (
                        <div className='flex-col space-y-1.5'>
                            <Label htmlFor='password'>Confirm Password</Label>
                            <Input id='confirmPassword' value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} type='password' placeholder='Password' />
                        </div>
                    )}
                    <div className='flex-col space-y-1.5'>
                        <Button type='submit' disabled={buttonDisabled} variant='default'>
                            {loadingUpdate && <ReloadIcon className='mr-2 animate-spin' />}
                            Update Profile
                        </Button>
                        <Button type='button' disabled={loadingDelete} onClick={submitDeleteProfile} className='ml-4' variant='destructive'>
                            {loadingDelete && <ReloadIcon className='mr-2 animate-spin' />}
                            Delete Profile
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Profile;