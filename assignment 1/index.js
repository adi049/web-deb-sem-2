require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

const tourRoutes = require('./routes/tourRoutes');
const authRoutes = require('./routes/authRoutes');

app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Tour & Travel API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api', tourRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
