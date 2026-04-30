import io from 'socket.io-client';

const getSocketUrl = () => {
    // If we are on localhost, connect to the local backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // Otherwise, use the API URL from env or fallback to current origin
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '');
    }
    return window.location.origin;
};

const socket = io(getSocketUrl(), {
    path: '/api/socket.io', // The backend server is always configured to use this path
    withCredentials: true,
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
});

export default socket;
