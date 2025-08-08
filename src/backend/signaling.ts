import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface Room {
    id: string;
    sender: string | null;
    receivers: string[];
    files: Array<{
        id: string;
        name: string;
        size: number;
        type: string;
    }>;
    createdAt: Date;
}

interface ConnectedUser {
    id: string;
    socketId: string;
    deviceInfo: {
        name: string;
        type: string;
    };
    role: 'sender' | 'receiver';
    roomId?: string;
}

export class SignalingServer {
    private io: SocketIOServer;
    private rooms: Map<string, Room> = new Map();
    private users: Map<string, ConnectedUser> = new Map();

    constructor(httpServer: HTTPServer) {
        const allowedOrigins = [
            "http://localhost:3000",
            "https://localhost:3000",
            process.env.FRONTEND_URL
        ].filter(Boolean) as string[];

        console.log('🔧 Configuring Socket.IO with CORS origins:', allowedOrigins);
        
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: ["http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"],
                methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                credentials: true,
                allowedHeaders: ["Content-Type", "Authorization"]
            },
            allowEIO3: true, // Allow Engine.IO v3 clients
            pingTimeout: 60000, // Increase ping timeout
            pingInterval: 25000, // Increase ping interval
            connectTimeout: 45000, // Increase connection timeout
            transports: ['websocket', 'polling'] // Explicitly allow both transports
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 User connected: ${socket.id}`);

            // Add debugging for all events
            socket.onAny((eventName, ...args) => {
                console.log(`📨 Received event: ${eventName}`, args);
            });

            // Handle room creation (sender)
            socket.on('create-room', (data: { deviceInfo: { name: string; type: string } }) => {
                console.log(`🔥 RECEIVED create-room event from ${socket.id}`, data);
                try {
                    console.log(`Creating room for user ${socket.id} with device:`, data.deviceInfo);
                    
                    const roomId = this.generateRoomCode();
                    const room: Room = {
                        id: roomId,
                        sender: socket.id,
                        receivers: [],
                        files: [],
                        createdAt: new Date()
                    };

                    this.rooms.set(roomId, room);
                    this.users.set(socket.id, {
                        id: socket.id,
                        socketId: socket.id,
                        deviceInfo: data.deviceInfo,
                        role: 'sender',
                        roomId: roomId
                    });

                    socket.join(roomId);
                    socket.emit('room-created', { roomId });
                    console.log(`✅ Room created successfully: ${roomId} by ${socket.id}`);
                } catch (error) {
                    console.error('❌ Error creating room:', error);
                    socket.emit('error', { message: 'Failed to create room' });
                }
            });

            // Handle room joining (receiver)
            socket.on('join-room', (data: { roomId: string; deviceInfo: { name: string; type: string } }) => {
                const room = this.rooms.get(data.roomId);
                
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                if (!room.sender) {
                    socket.emit('error', { message: 'Room is not active' });
                    return;
                }

                room.receivers.push(socket.id);
                this.users.set(socket.id, {
                    id: socket.id,
                    socketId: socket.id,
                    deviceInfo: data.deviceInfo,
                    role: 'receiver',
                    roomId: data.roomId
                });

                socket.join(data.roomId);
                
                // Get sender info
                const senderUser = this.users.get(room.sender);
                socket.emit('room-joined', { 
                    files: room.files,
                    senderId: room.sender,
                    senderInfo: senderUser?.deviceInfo
                });

                // Notify sender about new receiver
                if (room.sender) {
                    this.io.to(room.sender).emit('receiver-joined', {
                        receiverId: socket.id,
                        deviceInfo: data.deviceInfo
                    });
                }

                console.log(`User ${socket.id} joined room ${data.roomId}`);
            });

            // Handle file list update from sender
            socket.on('update-files', (data: { files: Array<{ id: string; name: string; size: number; type: string }> }) => {
                const user = this.users.get(socket.id);
                if (!user || user.role !== 'sender' || !user.roomId) return;

                const room = this.rooms.get(user.roomId);
                if (!room) return;

                room.files = data.files;
                
                // Notify all receivers about updated file list
                room.receivers.forEach(receiverId => {
                    this.io.to(receiverId).emit('files-updated', { files: room.files });
                });
            });

            // Handle WebRTC signaling
            socket.on('webrtc-offer', (data: { targetId: string; offer: RTCSessionDescriptionInit }) => {
                this.io.to(data.targetId).emit('webrtc-offer', {
                    senderId: socket.id,
                    offer: data.offer
                });
            });

            socket.on('webrtc-answer', (data: { targetId: string; answer: RTCSessionDescriptionInit }) => {
                this.io.to(data.targetId).emit('webrtc-answer', {
                    senderId: socket.id,
                    answer: data.answer
                });
            });

            socket.on('webrtc-ice-candidate', (data: { targetId: string; candidate: RTCIceCandidateInit }) => {
                this.io.to(data.targetId).emit('webrtc-ice-candidate', {
                    senderId: socket.id,
                    candidate: data.candidate
                });
            });

            // Handle file transfer request
            socket.on('request-file', (data: { fileId: string; targetId: string }) => {
                this.io.to(data.targetId).emit('file-requested', {
                    fileId: data.fileId,
                    requesterId: socket.id
                });
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
                this.handleUserDisconnect(socket.id);
            });
        });
    }

    private generateRoomCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Make sure the code is unique
        if (this.rooms.has(result)) {
            return this.generateRoomCode();
        }
        
        return result;
    }

    private handleUserDisconnect(socketId: string) {
        const user = this.users.get(socketId);
        if (!user || !user.roomId) return;

        const room = this.rooms.get(user.roomId);
        if (!room) return;

        if (user.role === 'sender') {
            // Notify all receivers that sender disconnected
            room.receivers.forEach(receiverId => {
                this.io.to(receiverId).emit('sender-disconnected');
            });
            
            // Remove the room
            this.rooms.delete(user.roomId);
        } else {
            // Remove receiver from room
            room.receivers = room.receivers.filter(id => id !== socketId);
            
            // Notify sender about receiver disconnect
            if (room.sender) {
                this.io.to(room.sender).emit('receiver-disconnected', {
                    receiverId: socketId
                });
            }
        }

        this.users.delete(socketId);
    }

    public getRoomCount(): number {
        return this.rooms.size;
    }

    public getUserCount(): number {
        return this.users.size;
    }
}