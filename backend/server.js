const path = require('path');
const dotenv = require('dotenv');

// Load environment-specific file (.env.development / .env.production), then fallback to .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeCronJobs } = require('./src/cron/recurringScheduler');
const { initializeExpiryCron } = require('./src/cron/expiryScheduler');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  path: '/api/socket.io',
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        process.env.FRONTEND_URL,
        'https://mye3etuitions.com',
        'https://www.mye3etuitions.com'
      ].filter(Boolean);
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible in requests
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket Connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User Disconnected');
  });
});

// Initialize Cron Jobs (after io is ready so auto-end can emit socket events)
initializeCronJobs();
initializeExpiryCron(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io is ready for real-time events`);
  });
});
