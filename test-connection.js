// Enhanced connection test script
const { io } = require('socket.io-client');

console.log('🔍 Starting comprehensive connection test...');

// Test 1: Backend health check
async function testBackendHealth() {
    console.log('\n📡 Test 1: Backend Health Check');
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend health check passed:', data);
            return true;
        } else {
            console.log('❌ Backend health check failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend health check error:', error.message);
        return false;
    }
}

// Test 2: Socket connection with different configurations
function testSocketConnection(config, testName) {
    return new Promise((resolve) => {
        console.log(`\n🔌 Test 2: ${testName}`);
        console.log('Config:', config);
        
        const socket = io('http://localhost:5000', config);
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.log(`❌ ${testName} - Connection timeout`);
                socket.disconnect();
                resolved = true;
                resolve(false);
            }
        }, 10000);
        
        socket.on('connect', () => {
            if (!resolved) {
                console.log(`✅ ${testName} - Connected! Socket ID:`, socket.id);
                console.log('Transport:', socket.io.engine.transport.name);
                clearTimeout(timeout);
                socket.disconnect();
                resolved = true;
                resolve(true);
            }
        });
        
        socket.on('connect_error', (error) => {
            if (!resolved) {
                console.log(`❌ ${testName} - Connection error:`, error.message);
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
    });
}

// Test 3: Room creation test
function testRoomCreation() {
    return new Promise((resolve) => {
        console.log('\n🏠 Test 3: Room Creation');
        
        const socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });
        
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                console.log('❌ Room creation timeout');
                socket.disconnect();
                resolved = true;
                resolve(false);
            }
        }, 15000);
        
        socket.on('connect', () => {
            console.log('✅ Connected, attempting room creation...');
            socket.emit('create-room', {
                deviceInfo: {
                    name: 'Test Device',
                    type: 'Connection Test'
                }
            });
        });
        
        socket.on('room-created', (data) => {
            if (!resolved) {
                console.log('✅ Room created successfully:', data.roomId);
                clearTimeout(timeout);
                socket.disconnect();
                resolved = true;
                resolve(true);
            }
        });
        
        socket.on('error', (error) => {
            if (!resolved) {
                console.log('❌ Room creation error:', error.message);
                clearTimeout(timeout);
                socket.disconnect();
                resolved = true;
                resolve(false);
            }
        });
        
        socket.on('connect_error', (error) => {
            if (!resolved) {
                console.log('❌ Connection error during room creation:', error.message);
                clearTimeout(timeout);
                resolved = true;
                resolve(false);
            }
        });
    });
}

// Run all tests
async function runTests() {
    console.log('🚀 Running connection diagnostics...\n');
    
    // Test backend health
    const healthOk = await testBackendHealth();
    
    if (!healthOk) {
        console.log('\n❌ Backend is not responding. Please ensure the backend server is running.');
        return;
    }
    
    // Test different socket configurations
    const configs = [
        {
            name: 'WebSocket First',
            config: { transports: ['websocket', 'polling'] }
        },
        {
            name: 'Polling First',
            config: { transports: ['polling', 'websocket'] }
        },
        {
            name: 'WebSocket Only',
            config: { transports: ['websocket'] }
        },
        {
            name: 'Polling Only',
            config: { transports: ['polling'] }
        },
        {
            name: 'Frontend Config',
            config: {
                transports: ['websocket', 'polling'],
                connectTimeout: 20000,
                timeout: 20000,
                forceNew: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                upgrade: true,
                rememberUpgrade: true
            }
        }
    ];
    
    for (const { name, config } of configs) {
        await testSocketConnection(config, name);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
    }
    
    // Test room creation
    await testRoomCreation();
    
    console.log('\n🏁 Connection diagnostics complete!');
}

runTests().catch(console.error);