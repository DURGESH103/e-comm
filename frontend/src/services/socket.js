import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    if (userId) socket.emit('register', userId);
  });

  socket.on('reconnect', () => {
    if (userId) socket.emit('register', userId);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const onOrderStatusUpdated = (callback) => {
  if (!socket) return;
  socket.off('order:statusUpdated');
  socket.on('order:statusUpdated', callback);
};

export const onOrderCreated = (callback) => {
  if (!socket) return;
  socket.off('order:created');
  socket.on('order:created', callback);
};
