let io = null;

// Map of userId -> Set of socketIds for targeted delivery
const userSockets = new Map();

const init = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    // Client sends their userId after connecting
    socket.on('register', (userId) => {
      if (!userId) return;
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(socket.id);
      socket.join(`user:${userId}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, sockets] of userSockets.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = { init, emitToUser, emitToAll };
