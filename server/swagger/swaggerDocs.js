// /Users/karthikgouda/Desktop/TravelDesk/server/swagger/swaggerDocs.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TravelDesk API',
      version: '1.0.0',
      description: 'End-to-end travel management platform API matching enterprise standards.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'airline_staff', 'admin'] },
          },
        },
        Flight: {
          type: 'object',
          properties: {
            airline: { type: 'string' },
            flightNumber: { type: 'string' },
            origin: { type: 'string' },
            destination: { type: 'string' },
            departureTime: { type: 'string', format: 'date-time' },
            arrivalTime: { type: 'string', format: 'date-time' },
            stops: { type: 'number' },
            price: { type: 'number' },
            cabinClass: { type: 'string', enum: ['economy', 'business', 'first'] },
            availableSeats: { type: 'number' },
          },
        },
        Hotel: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                city: { type: 'string' },
                country: { type: 'string' },
              },
            },
            starRating: { type: 'number' },
            amenities: { type: 'array', items: { type: 'string' } },
            totalRooms: { type: 'number' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['flight', 'hotel'] },
            referenceId: { type: 'string' },
            totalPrice: { type: 'number' },
            status: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Register a new user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'User registered' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login user',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful' },
          },
        },
      },
      '/api/flights': {
        get: {
          summary: 'Search flights',
          tags: ['Flights'],
          parameters: [
            { name: 'origin', in: 'query', schema: { type: 'string' } },
            { name: 'destination', in: 'query', schema: { type: 'string' } },
            { name: 'date', in: 'query', schema: { type: 'string' } },
            { name: 'cabinClass', in: 'query', schema: { type: 'string' } },
            { name: 'priceMin', in: 'query', schema: { type: 'number' } },
            { name: 'priceMax', in: 'query', schema: { type: 'number' } },
          ],
          responses: {
            200: { description: 'List of flights' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Scan routes for JSDoc tags
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
