const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      "frame-src": ["'self'", "https://api.razorpay.com", "https://tds.razorpay.com", "https://checkout.razorpay.com"],
      "connect-src": ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
    },
  },
}));

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
      'https://mye3etuitions.com',
      'https://www.mye3etuitions.com'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ["x-rzp-fingerprint-id", "request-id"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const studentRoutes = require('./routes/studentRoutes');
const payrollRoutes         = require('./routes/payrollRoutes');
const inquiryRoutes         = require('./routes/inquiryRoutes');
const personalSessionRoutes = require('./routes/personalSessionRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('Mye3-Elearning API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin/payroll', payrollRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api', personalSessionRoutes);
app.use('/api/public', publicRoutes);
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
