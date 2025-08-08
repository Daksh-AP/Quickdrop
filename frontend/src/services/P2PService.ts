import { io, Socket } from 'socket.io-client';
import { config } from '../config';

export interface FileInfo {
    id: string;
    name: string;
    size: number;
    type: string;
    file?: File;
}

export interface DeviceInfo {
    name: string;
    type: string;
}

export interface ConnectedDevice {
    id: string;
    deviceInfo: DeviceInfo;
    connectedAt: string;
}

export class P2PService {
    private static instance: P2PService | null = null;
    private socket: Socket | null = null;
    private peerConnections: Map<string, RTCPeerConnection> = new Map();
    private dataChannels: Map<string, RTCDataChannel> = new Map();
    private files: Map<string, File> = new Map();
    private onConnectionStateChange?: (state: string) => void;
    private onFileReceived?: (file: File) => void;
    private onTransferProgress?: (fileId: string, progress: number) => void;
    private onDeviceConnected?: (device: ConnectedDevice) => void;
    private onDeviceDisconnected?: (deviceId: string) => void;
    private onFilesUpdated?: (files: FileInfo[]) => void;
    private isInitialized: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    constructor() {
        if (P2PService.instance) {
            console.log('🔌 Returning existing P2P service instance');
            return P2PService.instance;
        }
        console.log('🔌 Creating new P2P service instance');
        P2PService.instance = this;
    }

    // Singleton getter with proper initialization
    public static getInstance(): P2PService {
        if (!P2PService.instance) {
            P2PService.instance = new P2PService();
        }
        return P2PService.instance;
    }

    // Initialize connection if not already done
    public async initialize(): Promise<void> {
        if (this.isInitialized && this.socket?.connected) {
            console.log('🔌 Already initialized and connected');
            return Promise.resolve();
        }

        if (this.connectionPromise) {
            console.log('🔌 Connection already in progress, waiting...');
            return this.connectionPromise;
        }

        console.log('🔌 Starting new initialization...');
        this.connectionPromise = this.setupSocket();
        return this.connectionPromise;
    }

    // Check connection status
    public isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Get socket ID
    public getSocketId(): string | undefined {
        return this.socket?.id;
    }

    // Test backend connectivity
    public async testBackendConnectivity(): Promise<boolean> {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/health`, {
                method: 'GET',
                timeout: 5000
            } as any);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend health check passed:', data);
                return true;
            } else {
                console.error('❌ Backend health check failed:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Backend connectivity test failed:', error);
            return false;
        }
    }

    private setupSocket(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isInitialized && this.socket?.connected) {
                console.log('🔌 Socket already initialized and connected');
                resolve();
                return;
            }

            // Clean up existing socket if any
            if (this.socket) {
                console.log('🔌 Cleaning up existing socket connection');
                this.socket.disconnect();
                this.socket = null;
            }
            
            console.log('🔌 Setting up socket connection to:', config.BACKEND_URL);
            console.log('🔧 Socket.io client version: ', (window as any).io?.version);
            this.isInitialized = true;
        
            // Try with minimal configuration first
            this.socket = io(config.BACKEND_URL, {
                transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
                timeout: 20000, // Connection timeout
                forceNew: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                upgrade: true, // Allow transport upgrades
                rememberUpgrade: true // Remember successful upgrades
            });

            console.log('🔌 Socket instance created, attempting connection...');

            // Set up one-time connection handlers
            const onConnect = () => {
                console.log('✅ Connected to signaling server, socket ID:', this.socket?.id);
                console.log('🔗 Socket connected state:', this.socket?.connected);
                console.log('🌐 Socket transport:', this.socket?.io?.engine?.transport?.name);
                this.onConnectionStateChange?.('connected');
                
                // Clean up one-time handlers
                this.socket?.off('connect', onConnect);
                this.socket?.off('connect_error', onConnectError);
                this.socket?.off('connect_timeout', onConnectTimeout);
                
                resolve();
            };

            const onConnectError = (error: any) => {
                console.error('❌ Socket connection error:', error);
                console.error('❌ Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                    type: (error as any).type,
                    description: (error as any).description
                });
                console.error('❌ Backend URL:', config.BACKEND_URL);
                console.error('❌ Socket transport attempts:', this.socket?.io?.engine?.transport?.name);
                this.onConnectionStateChange?.('error');
                
                // Clean up one-time handlers
                this.socket?.off('connect', onConnect);
                this.socket?.off('connect_error', onConnectError);
                this.socket?.off('connect_timeout', onConnectTimeout);
                
                reject(error);
            };

            const onConnectTimeout = () => {
                console.error('❌ Socket connection timeout - server may be unreachable');
                console.error('❌ Attempted URL:', config.BACKEND_URL);
                this.onConnectionStateChange?.('timeout');
                
                // Clean up one-time handlers
                this.socket?.off('connect', onConnect);
                this.socket?.off('connect_error', onConnectError);
                this.socket?.off('connect_timeout', onConnectTimeout);
                
                reject(new Error('Connection timeout'));
            };

            // Set up one-time handlers
            this.socket.once('connect', onConnect);
            this.socket.once('connect_error', onConnectError);
            this.socket.once('connect_timeout', onConnectTimeout);

            // Set up persistent handlers
            this.socket.on('reconnect', (attemptNumber) => {
                console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            });

            this.socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('🔄 Socket reconnection attempt', attemptNumber);
            });

            this.socket.on('reconnect_error', (error) => {
                console.error('❌ Socket reconnection error:', error);
            });

            this.socket.on('reconnect_failed', () => {
                console.error('❌ Socket reconnection failed');
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 Disconnected from signaling server, reason:', reason);
                this.onConnectionStateChange?.('disconnected');
            });

            // Set up application event handlers
            this.setupApplicationEventHandlers();
        });
    }

    private setupApplicationEventHandlers() {
        if (!this.socket) return;

        this.socket.on('room-created', (data: { roomId: string }) => {
            console.log('Room created:', data.roomId);
            this.onConnectionStateChange?.('room-created');
        });

        this.socket.on('room-joined', (data: { files: FileInfo[]; senderId: string; senderInfo: DeviceInfo }) => {
            console.log('Room joined, available files:', data.files);
            console.log('Connected to sender:', data.senderId, data.senderInfo);
            
            this.onFilesUpdated?.(data.files);
            this.onConnectionStateChange?.('room-joined');
            
            // Notify about the connected sender
            if (data.senderId && data.senderInfo) {
                this.onDeviceConnected?.({
                    id: data.senderId,
                    deviceInfo: data.senderInfo,
                    connectedAt: new Date().toLocaleTimeString()
                });
            }
        });

        this.socket.on('receiver-joined', (data: { receiverId: string; deviceInfo: DeviceInfo }) => {
            console.log('Receiver joined:', data);
            this.setupPeerConnection(data.receiverId, true);
            this.onDeviceConnected?.({
                id: data.receiverId,
                deviceInfo: data.deviceInfo,
                connectedAt: new Date().toLocaleTimeString()
            });
        });

        this.socket.on('files-updated', (data: { files: FileInfo[] }) => {
            this.onFilesUpdated?.(data.files);
        });

        this.socket.on('webrtc-offer', async (data: { senderId: string; offer: RTCSessionDescriptionInit }) => {
            await this.handleOffer(data.senderId, data.offer);
        });

        this.socket.on('webrtc-answer', async (data: { senderId: string; answer: RTCSessionDescriptionInit }) => {
            await this.handleAnswer(data.senderId, data.answer);
        });

        this.socket.on('webrtc-ice-candidate', async (data: { senderId: string; candidate: RTCIceCandidateInit }) => {
            await this.handleIceCandidate(data.senderId, data.candidate);
        });

        this.socket.on('file-requested', (data: { fileId: string; requesterId: string }) => {
            this.sendFile(data.fileId, data.requesterId);
        });

        this.socket.on('error', (data: { message: string }) => {
            console.error('Server error:', data.message);
            this.onConnectionStateChange?.('error');
        });
    }

    // Create room as sender
    public async createRoom(deviceInfo: DeviceInfo): Promise<string> {
        // Ensure socket is initialized and connected
        await this.initialize();

        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log('Creating room with device info:', deviceInfo);
            console.log('Socket connected:', this.socket.connected);
            console.log('Socket ID:', this.socket.id);

            // Set up event listeners first
            const onRoomCreated = (data: { roomId: string }) => {
                console.log('🎉 Room created successfully:', data.roomId);
                cleanup();
                resolve(data.roomId);
            };

            const onError = (error: { message: string }) => {
                console.error('❌ Error creating room:', error.message);
                cleanup();
                reject(new Error(error.message));
            };

            const cleanup = () => {
                if (this.socket) {
                    this.socket.off('room-created', onRoomCreated);
                    this.socket.off('error', onError);
                }
            };

            this.socket.once('room-created', onRoomCreated);
            this.socket.once('error', onError);

            // Socket is guaranteed to be connected at this point
            console.log('🚀 Emitting create-room event...');
            this.socket.emit('create-room', { deviceInfo });

            // Add timeout to prevent hanging
            setTimeout(() => {
                cleanup();
                reject(new Error('Room creation timeout - no response from server'));
            }, 10000);
        });
    }

    // Join room as receiver
    public async joinRoom(roomId: string, deviceInfo: DeviceInfo): Promise<void> {
        // Ensure socket is initialized and connected
        await this.initialize();

        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            this.socket.emit('join-room', { roomId, deviceInfo });
            
            this.socket.once('room-joined', () => {
                resolve();
            });

            this.socket.once('error', (error: { message: string }) => {
                reject(new Error(error.message));
            });
        });
    }

    // Update files list (sender only)
    public updateFiles(files: File[]) {
        if (!this.socket) return;

        const fileInfos: FileInfo[] = files.map((file, index) => ({
            id: `file_${Date.now()}_${index}`,
            name: file.name,
            size: file.size,
            type: file.type,
        }));

        // Store files locally
        files.forEach((file, index) => {
            this.files.set(fileInfos[index].id, file);
        });

        this.socket.emit('update-files', { files: fileInfos });
    }

    // Request file download (receiver only)
    public requestFile(fileId: string, senderId: string) {
        if (!this.socket) return;
        this.socket.emit('request-file', { fileId, targetId: senderId });
    }

    // Setup WebRTC peer connection
    private async setupPeerConnection(peerId: string, isInitiator: boolean) {
        console.log('🔗 Setting up peer connection with:', peerId, 'isInitiator:', isInitiator);
        console.log('🌐 Using ICE servers:', config.ICE_SERVERS);
        
        const peerConnection = new RTCPeerConnection({
            iceServers: config.ICE_SERVERS
        });

        this.peerConnections.set(peerId, peerConnection);

        // Log connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('🔗 Peer connection state:', peerConnection.connectionState);
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', peerConnection.iceConnectionState);
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.socket) {
                this.socket.emit('webrtc-ice-candidate', {
                    targetId: peerId,
                    candidate: event.candidate
                });
            }
        };

        // Handle data channel
        if (isInitiator) {
            const dataChannel = peerConnection.createDataChannel('fileTransfer', {
                ordered: true
            });
            this.setupDataChannel(dataChannel, peerId);
        } else {
            peerConnection.ondatachannel = (event) => {
                this.setupDataChannel(event.channel, peerId);
            };
        }

        if (isInitiator) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            if (this.socket) {
                this.socket.emit('webrtc-offer', {
                    targetId: peerId,
                    offer: offer
                });
            }
        }
    }

    private setupDataChannel(dataChannel: RTCDataChannel, peerId: string) {
        this.dataChannels.set(peerId, dataChannel);

        dataChannel.onopen = () => {
            console.log('Data channel opened with', peerId);
        };

        dataChannel.onmessage = (event) => {
            this.handleDataChannelMessage(event.data, peerId);
        };

        dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
    }

    private async handleOffer(senderId: string, offer: RTCSessionDescriptionInit) {
        await this.setupPeerConnection(senderId, false);
        const peerConnection = this.peerConnections.get(senderId);
        
        if (peerConnection) {
            await peerConnection.setRemoteDescription(offer);
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            if (this.socket) {
                this.socket.emit('webrtc-answer', {
                    targetId: senderId,
                    answer: answer
                });
            }
        }
    }

    private async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit) {
        const peerConnection = this.peerConnections.get(senderId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(answer);
        }
    }

    private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
        const peerConnection = this.peerConnections.get(senderId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(candidate);
        }
    }

    private receivedChunks: Map<string, { chunks: ArrayBuffer[]; totalSize: number; receivedSize: number; fileName: string }> = new Map();

    private handleDataChannelMessage(data: any, peerId: string) {
        try {
            if (typeof data === 'string') {
                const message = JSON.parse(data);
                
                if (message.type === 'file-start') {
                    this.receivedChunks.set(message.fileId, {
                        chunks: [],
                        totalSize: message.size,
                        receivedSize: 0,
                        fileName: message.name
                    });
                } else if (message.type === 'file-end') {
                    const fileData = this.receivedChunks.get(message.fileId);
                    if (fileData) {
                        const blob = new Blob(fileData.chunks);
                        const file = new File([blob], fileData.fileName);
                        this.onFileReceived?.(file);
                        this.receivedChunks.delete(message.fileId);
                    }
                }
            } else {
                // Binary data (file chunk)
                const view = new DataView(data);
                const fileIdLength = view.getUint32(0);
                const fileId = new TextDecoder().decode(data.slice(4, 4 + fileIdLength));
                const chunk = data.slice(4 + fileIdLength);
                
                const fileData = this.receivedChunks.get(fileId);
                if (fileData) {
                    fileData.chunks.push(chunk);
                    fileData.receivedSize += chunk.byteLength;
                    
                    const progress = (fileData.receivedSize / fileData.totalSize) * 100;
                    this.onTransferProgress?.(fileId, progress);
                }
            }
        } catch (error) {
            console.error('Error handling data channel message:', error);
        }
    }

    private async sendFile(fileId: string, receiverId: string) {
        const file = this.files.get(fileId);
        const dataChannel = this.dataChannels.get(receiverId);
        
        if (!file || !dataChannel) return;

        // Send file start message
        dataChannel.send(JSON.stringify({
            type: 'file-start',
            fileId: fileId,
            name: file.name,
            size: file.size
        }));

        // Send file in chunks
        const chunkSize = 16384; // 16KB chunks
        const reader = new FileReader();
        let offset = 0;

        const sendChunk = () => {
            const slice = file.slice(offset, offset + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = (event) => {
            if (event.target?.result) {
                const chunk = event.target.result as ArrayBuffer;
                
                // Create message with file ID prefix
                const fileIdBytes = new TextEncoder().encode(fileId);
                const message = new ArrayBuffer(4 + fileIdBytes.length + chunk.byteLength);
                const view = new DataView(message);
                
                view.setUint32(0, fileIdBytes.length);
                new Uint8Array(message, 4, fileIdBytes.length).set(fileIdBytes);
                new Uint8Array(message, 4 + fileIdBytes.length).set(new Uint8Array(chunk));
                
                dataChannel.send(message);
                
                offset += chunkSize;
                const progress = Math.min((offset / file.size) * 100, 100);
                this.onTransferProgress?.(fileId, progress);
                
                if (offset < file.size) {
                    sendChunk();
                } else {
                    // Send file end message
                    dataChannel.send(JSON.stringify({
                        type: 'file-end',
                        fileId: fileId
                    }));
                }
            }
        };

        sendChunk();
    }

    // Event handlers
    public onConnectionStateChanged(callback: (state: string) => void) {
        this.onConnectionStateChange = callback;
    }

    public onFileReceivedCallback(callback: (file: File) => void) {
        this.onFileReceived = callback;
    }

    public onTransferProgressCallback(callback: (fileId: string, progress: number) => void) {
        this.onTransferProgress = callback;
    }

    public onDeviceConnectedCallback(callback: (device: ConnectedDevice) => void) {
        this.onDeviceConnected = callback;
    }

    public onDeviceDisconnectedCallback(callback: (deviceId: string) => void) {
        this.onDeviceDisconnected = callback;
    }

    public onFilesUpdatedCallback(callback: (files: FileInfo[]) => void) {
        this.onFilesUpdated = callback;
    }

    public disconnect() {
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.dataChannels.clear();
        this.files.clear();
        this.socket?.disconnect();
        this.socket = null;
        this.isInitialized = false;
        this.connectionPromise = null;
    }

    // Reset singleton (for development/testing)
    public static reset() {
        if (P2PService.instance) {
            P2PService.instance.disconnect();
            P2PService.instance = null;
        }
    }
}