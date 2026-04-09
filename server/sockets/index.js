// /Users/karthikgouda/Desktop/TravelDesk/server/sockets/index.js

/**
 * Initializes Socket.io on the existing HTTP server.
 * Exposes a module-level `getIO()` accessor so controllers
 * can emit events without circular dependency issues.
 *
 * Events emitted:
 *  - `seat:updated`  — when a seat changes status (held/booked/available)
 *  - `room:updated`  — when a hotel room changes status (booked/available)
 *  - `booking:new`   — when a new booking is confirmed
 */

const { Server } = require('socket.io');

let io;

/**
 * @param {http.Server} httpServer - Node.js HTTP server instance
 * @returns {Server} - Initialized Socket.io server instance
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Allow clients to subscribe to a specific flight room for targeted updates
    socket.on('flight:subscribe', (flightId) => {
      socket.join(`flight:${flightId}`);
    });
    socket.on('flight:unsubscribe', (flightId) => {
      socket.leave(`flight:${flightId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Emits a flight:priceUpdate event to all connected clients.
 * Called from bookingController after a flight seat is booked/released.
 * @param {string} flightId
 * @param {number} availableSeats
 * @param {number} price
 * @param {string} airline
 */
const emitFlightUpdate = (flightId, availableSeats, price, airline) => {
  if (!io) return;
  const payload = { flightId, availableSeats, price, airline, timestamp: Date.now() };
  // Broadcast globally AND to the flight-specific room
  io.emit('flight:priceUpdate', payload);
  io.to(`flight:${flightId}`).emit('flight:priceUpdate', payload);
};

/**
 * Returns the initialized Socket.io instance.
 * Call this from controllers after initSocket() has been called.
 * @returns {Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket() first.');
  }
  return io;
};

module.exports = { initSocket, getIO, emitFlightUpdate };
