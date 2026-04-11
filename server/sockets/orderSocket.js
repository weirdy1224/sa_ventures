const initSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // Join order room for real-time tracking
    socket.on('join:order', (orderId) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    // Chat between delivery person and staff
    socket.on('chat:message', ({ orderId, message, sender }) => {
      io.to(`order:${orderId}`).emit('chat:message', {
        orderId, message, sender, timestamp: new Date(),
      });
    });

    // Delivery location update (from delivery person's device)
    socket.on('delivery:location', ({ orderId, lat, lng }) => {
      io.to(`order:${orderId}`).emit('delivery:location', { lat, lng, timestamp: new Date() });
    });

    socket.on('disconnect', () => {});
  });
};

module.exports = { initSocketHandlers };
