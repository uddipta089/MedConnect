import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const initSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.user.id}, Role: ${socket.user.role}`);

    // Join personal room
    socket.join(`user:${socket.user.id}`);
    
    // Join role specific room
    if (socket.user.role === 'Patient') socket.join(`patient:${socket.user.id}`);
    if (socket.user.role === 'Doctor') socket.join(`doctor:${socket.user.id}`);
    if (socket.user.role === 'Admin') socket.join('admin');

    // WebRTC Signaling Events
    socket.on('callUser', ({ userToCall, signalData, from, name }) => {
      io.to(`user:${userToCall}`).emit('callUser', { signal: signalData, from, name });
    });

    socket.on('answerCall', (data) => {
      io.to(`user:${data.to}`).emit('callAccepted', data.signal);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
