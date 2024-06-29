import { getUsers } from '@/api';
import Layout from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/provider/users';
import { useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

const Dashboard = ()=> {
    const { users, setUsers, onlineUsers, playerInfo } = useUsers();

    useEffect(()=> {
        getUsers().then(({ data }) => {
            setUsers(data);
        });
    }, []);

    return (
        <Layout>
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                        Hi {playerInfo.username}, Welcome back 👋
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
                        <div className="text-2xl font-bold">{playerInfo.wins}</div>
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
                        <div className="text-2xl font-bold">{playerInfo.loses}</div>
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
                        <div className="text-2xl font-bold">{playerInfo.draws}</div>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>All Players</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        { users.length ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>N°</TableHead>
                                        <TableHead>UserName</TableHead>
                                        <TableHead>Wins</TableHead>
                                        <TableHead>Loses</TableHead>
                                        <TableHead>Draws</TableHead>
                                        <TableHead>Created At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        users.map((user, i) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{i + 1}°</TableCell>
                                                <TableCell className="font-medium">{user.username}</TableCell>
                                                <TableCell>{user.wins}</TableCell>
                                                <TableCell>{user.loses}</TableCell>
                                                <TableCell>{user.draws}</TableCell>
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString()}</TableCell>
                                            </TableRow>
                                        ))
                                    } 
                                </TableBody>
                            </Table>
                        ) : 'No Players Yet'
                        }
                                
                    </CardContent>
                </Card>
                <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                        <CardTitle>Online Players</CardTitle>
                        <CardDescription>
                                    Players online available to play
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                                No players yet
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Dashboard;
