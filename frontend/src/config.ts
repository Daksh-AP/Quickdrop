export const config = {
  // Use environment variable or fallback to Railway production backend
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://web-production-9fcda.up.railway.app',
  
  // WebRTC STUN servers for production
  ICE_SERVERS: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
  ]
};