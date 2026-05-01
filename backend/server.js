require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth.routes');
const projectRoutes = require('./src/routes/project.routes');
const taskRoutes = require('./src/routes/task.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true // needed for cookies to work cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/', taskRoutes);

// basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
