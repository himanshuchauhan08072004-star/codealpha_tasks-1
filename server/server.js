require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { commentRouter } = require('./routes/commentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

connectDB();

const app = express();

const clientUrl = process.env.CLIENT_URL;
if (!clientUrl && process.env.NODE_ENV === 'production') {
  console.warn('Warning: CLIENT_URL is not set. CORS will reject browser requests.');
}

app.use(cors({ origin: clientUrl || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Try again later.' }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: clientUrl || 'http://localhost:5173' }
});

io.on('connection', (socket) => {
  socket.on('joinProject', (projectId) => socket.join(`project:${projectId}`));
  socket.on('leaveProject', (projectId) => socket.leave(`project:${projectId}`));
  socket.on('identify', (userId) => userId && socket.join(`user:${userId}`));
  socket.on('disconnect', () => {});
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
