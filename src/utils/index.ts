import { socket } from '@/socket-client/socket';

export const logout = () => {
    if (localStorage.getItem('@UserId')) {
        socket.emit('UserDisconnected', localStorage.getItem('@UserId'));
    }

    localStorage.clear();
};

export const formatDateTime = (dateTimeString: string) => {
    const dateTime = new Date(dateTimeString).valueOf();
    const now = Date.now();

    const dateTimeDifferenceInSeconds = (now - dateTime) * 0.001;

    const minutesInSeconds = 60;
    const hourInSeconds = minutesInSeconds * 60;
    const dayInSeconds = hourInSeconds * 24;
    const weekInSeconds = dayInSeconds * 7;
    const monthInSeconds = dayInSeconds * 30;
    const yearInSeconds = dayInSeconds * 365;

    if (dateTimeDifferenceInSeconds < minutesInSeconds) {
        return `${dateTimeDifferenceInSeconds.toFixed(0)} ${dateTimeDifferenceInSeconds > 1 ? 'seconds' : 'second'} ago`;
    }

    if (dateTimeDifferenceInSeconds < hourInSeconds) {
        const minutes = Math.round(dateTimeDifferenceInSeconds / minutesInSeconds);
        return `${minutes.toFixed(0)} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
    }

    if (dateTimeDifferenceInSeconds < dayInSeconds) {
        const hours = Math.round(dateTimeDifferenceInSeconds / hourInSeconds);
        return `${hours.toFixed(0)} ${hours > 1 ? 'hours' : 'hour'} ago`;
    }

    if (dateTimeDifferenceInSeconds < weekInSeconds) {
        const days = Math.round(dateTimeDifferenceInSeconds / dayInSeconds); 
        return `${days.toFixed(0)} ${days > 1 ? 'days' : 'day'} ago`;
    }

    if (dateTimeDifferenceInSeconds < monthInSeconds) {
        const weeks = Math.round(dateTimeDifferenceInSeconds / weekInSeconds); 
        return `${weeks.toFixed(0)} ${weeks > 1 ? 'weeks' : 'week'} ago`;
    }

    if (dateTimeDifferenceInSeconds < yearInSeconds) {
        const monts = Math.round(dateTimeDifferenceInSeconds / monthInSeconds); 
        return `${monts.toFixed(0)} ${monts > 1 ? 'months' : 'month'} ago`;
    }

    return new Date(dateTimeString).toLocaleString();

};
