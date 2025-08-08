# 🌊 Quickdrop

A fast, secure peer-to-peer file sharing application with a beautiful ocean-themed UI. Built with React, Node.js, and WebRTC.

## ✨ Features

- **Direct P2P Transfer**: Files transfer directly between devices without cloud storage
- **Real-time Connection**: WebRTC for fast, secure connections
- **Cross-Platform**: Works on desktop, mobile, and tablets
- **Beautiful UI**: Modern Material Design interface with ocean theme
- **Progress Tracking**: Real-time upload/download progress
- **Room-based Sharing**: Simple 6-digit codes for easy connection

## 🛠️ Tech Stack

### Frontend
- React 19 with TypeScript
- Material-UI for components
- Socket.IO client for signaling
- WebRTC for P2P connections

### Backend
- Node.js with Express
- Socket.IO for WebSocket signaling
- TypeScript for type safety
- Winston for logging

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Windows-concept/quickdrop.git
   cd quickdrop
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

5. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Deployment

#### Option 1: Railway + Vercel (Recommended)

**Backend (Railway):**
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variable: `FRONTEND_URL=https://your-app.vercel.app`
4. Deploy automatically

**Frontend (Vercel):**
1. Connect Vercel to your GitHub repo
2. Set build command: `npm run build`
3. Set environment variable: `REACT_APP_BACKEND_URL=https://your-app.railway.app`
4. Deploy automatically

#### Option 2: Heroku (All-in-one)
1. Create Heroku app
2. Connect to GitHub repo
3. Enable automatic deploys
4. Set environment variables in Heroku dashboard

## 📱 How to Use

### Sharing Files (Sender)
1. Go to the **Share** page
2. Click "Select Files to Share"
3. Choose your files
4. Click "Start Sharing"
5. Share the 6-digit code with others

### Receiving Files (Receiver)
1. Go to the **Receive** page
2. Enter the 6-digit share code
3. Click "Connect"
4. Browse available files
5. Click "Download" on desired files

## 🔒 Security & Privacy

- **No Cloud Storage**: Files never leave your local network
- **WebRTC Encryption**: All transfers are encrypted
- **Temporary Codes**: Share codes expire when session ends
- **Direct Connection**: No intermediary servers handle your files

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Made with ❤️ for secure, private file sharing