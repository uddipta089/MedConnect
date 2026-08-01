import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initSocket } from './socket/socketManager.js';
import { initCronJobs } from './utils/cron.js';
import { errorHandler, notFound } from './middleware/error.js';

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

initSocket(io);
initCronJobs();

app.set('io', io); // Make io accessible in routes

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration for Render/Vercel deployment
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// API Documentation
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Swagger Documentation
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'MedConnect AI API', version: '1.0.0' },
  paths: {
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        responses: { '200': { description: 'Successful login' } }
      }
    }
  }
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app; // For testing
