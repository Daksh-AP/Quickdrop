export const config = {
  // Use environment variable or fallback to localhost for development
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  
  // WebRTC STUN servers for production
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};