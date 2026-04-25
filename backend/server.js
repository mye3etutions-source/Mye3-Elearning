require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initializeCronJobs } = require('./src/cron/recurringScheduler');
const { initializeExpiryCron } = require('./src/cron/expiryScheduler');

const seedData = require('./src/config/seed');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Cron Jobs
initializeCronJobs();
initializeExpiryCron();

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
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

connectDB().then(async () => {
  await seedData();
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Socket.io is ready for real-time events`);
  });
});
