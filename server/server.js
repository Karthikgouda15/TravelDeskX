// /Users/karthikgouda/Desktop/TravelDesk/server/server.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');

// Config and DB
dotenv.config();
const connectDB = require('./config/db');
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const flightRoutes = require('./routes/flightRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const transportRoutes = require('./routes/transportRoutes');
const trainRoutes = require('./routes/trainRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerDocs');

// Custom error handler
const errorHandler = require('./middleware/error');

// Socket.io
const { initSocket } = require('./sockets/index');

const busRoutes = require('./routes/busRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io on the HTTP server
initSocket(server);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Static file serving for generated images
app.use('/public', express.static('public'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, // Balanced for enterprise platform testing
  message: 'Multiple security alerts detected. Port access throttled for your safety.',
  handler: (req, res, next, options) => {
    return apiResponse(res, 429, false, null, options.message);
  },
});
app.use('/api', limiter);

// Standardized API response formatter helper for internal use if needed
const apiResponse = require('./utils/apiResponse');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/buses', busRoutes);

// Swagger Documentation API
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Custom Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Status: UNHANDLED_REJECTION: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
