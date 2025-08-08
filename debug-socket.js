// Simple Node.js client to test socket connection
const { io } = require('socket.io-client');

console.log('🔌 Testing socket connection to http://localhost:5000');

const socket = io('http://localhost:5000', {
    transports: ['polling', 'websocket'],
    timeout: 5000
});

socket.on('connect', () => {
    console.log('✅ Connected! Socket ID:', socket.id);
    
    // Test room creation
    console.log('🚀 Testing room creation...');
    socket.emit('create-room', {
        deviceInfo: {
            name: 'Test Device',
            type: 'Node.js Client'
        }
    });
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
});

socket.on('room-created', (data) => {
    console.log('🎉 Room created successfully:', data.roomId);
    process.exit(0);
});

socket.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.error('❌ Test timed out');
    process.exit(1);
}, 10000);