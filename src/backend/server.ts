import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileRouter } from './routes/fileRouter';
import { SignalingServer } from './signaling';
import winston from 'winston';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize signaling server
const signalingServer = new SignalingServer(httpServer);

// Middleware
const allowedOrigins = [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: ["http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/files', fileRouter);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Quickdrop API Server',
        version: '1.0.0',
        endpoints: {
            files: '/api/files',
            websocket: '/socket.io'
        },
        stats: {
            activeRooms: signalingServer.getRoomCount(),
            connectedUsers: signalingServer.getUserCount()
        }
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        stats: {
            activeRooms: signalingServer.getRoomCount(),
            connectedUsers: signalingServer.getUserCount()
        }
    });
});

// Start the server
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console()
    ]
});

httpServer.listen(PORT, () => {
    logger.info(`Quickdrop Server is running on http://localhost:${PORT}`);
    logger.info(`WebSocket signaling server is ready`);
});