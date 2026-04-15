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

    // Allow clients to subscribe to a specific flight room
    socket.on('flight:subscribe', (flightId) => {
      socket.join(`flight:${flightId}`);
    });
    socket.on('flight:unsubscribe', (flightId) => {
      socket.leave(`flight:${flightId}`);
    });

    // Train subscription
    socket.on('train:subscribe', (trainId) => {
      socket.join(`train:${trainId}`);
    });
    socket.on('train:unsubscribe', (trainId) => {
      socket.leave(`train:${trainId}`);
    });

    // Bus Subscriptions
    socket.on('bus:subscribe', (busId) => {
      socket.join(`bus:${busId}`);
      console.log(`🚍 User joined bus room: ${busId}`);
    });

    socket.on('bus:unsubscribe', (busId) => {
      socket.leave(`bus:${busId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
};

/**
 * Emits a flight:priceUpdate event
 */
const emitFlightUpdate = (flightId, availableSeats, price, airline) => {
  if (!io) return;
  const payload = { flightId, availableSeats, price, airline, timestamp: Date.now() };
  io.emit('flight:priceUpdate', payload);
  io.to(`flight:${flightId}`).emit('flight:priceUpdate', payload);
};

/**
 * Emits a train:seatUpdate event
 */
const emitTrainUpdate = (trainId, classType, availableSeats) => {
  if (!io) return;
  const payload = { trainId, classType, availableSeats, timestamp: Date.now() };
  io.emit('train:seatUpdate', payload);
  io.to(`train:${trainId}`).emit('train:seatUpdate', payload);
};

/**
 * Emits a bus:seatUpdate event
 */
const emitBusUpdate = (busId, availableSeats) => {
  if (!io) return;
  const payload = { busId, availableSeats, timestamp: Date.now() };
  io.emit('bus:seatUpdate', payload);
  io.to(`bus:${busId}`).emit('bus:seatUpdate', payload);
};

/**
 * Returns the initialized Socket.io instance.
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket() first.');
  }
  return io;
};

module.exports = { initSocket, getIO, emitFlightUpdate, emitTrainUpdate, emitBusUpdate };
