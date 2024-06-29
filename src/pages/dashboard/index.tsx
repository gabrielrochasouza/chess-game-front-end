import { getUsers } from '@/api';
import Layout from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUsers } from '@/provider/users';
import { useEffect } from 'react';

const Dashboard = ()=> {
    const { users, setUsers, onlineUsers } = useUsers();

    useEffect(()=> {
        getUsers().then(({ data }) => {
            setUsers(data);
        });
    })

    return (
        <Layout>
            <ScrollArea className="h-full">
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">
                        Hi, Welcome back 👋
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Players Online
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{onlineUsers || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                        Number of wins
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                        Number of losses
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                        Number of draws
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Players {users.length && `- ${users.length}` }</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-6">
                                { users.length ? (
                                    users.map(user => (
                                        <Card className='py-4 px-4 my-4 cursor-pointer flex' key={user.id}>
                                            <img className='rounded-full w-14 h-14 mr-4 object-cover' src={user.profilePic} alt={user.username} />
                                            <CardContent className='pl-0 py-0 my-0'>
                                                <CardTitle className='pb-2'>
                                                    {user.username}
                                                </CardTitle>
                                                <div>
                                                    <span>Wins: {user.wins}</span>
                                                    <span className='px-3'>•</span>                                                    
                                                    <span>Loses: {user.loses}</span>
                                                    <span className='px-3'>•</span>                                                    
                                                    <span>Draws: {user.draws}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : 'No players yet' }
                                
                            </CardContent>
                        </Card>
                        <Card className="col-span-4 md:col-span-3">
                            <CardHeader>
                                <CardTitle>Rank</CardTitle>
                                <CardDescription>
                                    Rank of best players
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                No players yet
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </ScrollArea>
        </Layout>
    )
}

export default Dashboard;
