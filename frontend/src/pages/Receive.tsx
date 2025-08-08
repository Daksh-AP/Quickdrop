import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GradientBackground from '../components/GradientBackground';
import FileCard from '../components/FileCard';
import { P2PService, FileInfo } from '../services/P2PService';

const StyledCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '20px',
  margin: '20px',
  minWidth: '400px',
  maxWidth: '600px',
});

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '10px',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#6FA3EF',
    },
  },
});

const Receive: React.FC = () => {
  const [shareCode, setShareCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<FileInfo[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({});
  const [error, setError] = useState('');
  const [senderInfo, setSenderInfo] = useState<{name: string, deviceType: string} | null>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [p2pService] = useState(() => P2PService.getInstance());
  const [downloadedFiles, setDownloadedFiles] = useState<File[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [senderId, setSenderId] = useState<string>('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    // Setup P2P service event handlers
    p2pService.onConnectionStateChanged((state) => {
      setConnectionState(state);
      if (state === 'room-joined') {
        setIsConnected(true);
        setIsConnecting(false);
        setSenderInfo({ name: 'Sender Device', deviceType: 'Computer' });
      } else if (state === 'error') {
        setError('Failed to connect. Please check the share code and try again.');
        setIsConnecting(false);
      }
    });

    // Track connected devices (senders)
    p2pService.onDeviceConnectedCallback((device) => {
      console.log('🔗 Device connected:', device);
      setSenderId(device.id);
      setSenderInfo({ name: device.deviceInfo.name, deviceType: device.deviceInfo.type });
    });

    p2pService.onFilesUpdatedCallback((files) => {
      setAvailableFiles(files);
    });

    p2pService.onTransferProgressCallback((fileId, progress) => {
      setDownloadProgress(prev => ({ ...prev, [fileId]: progress }));
      
      // Remove progress when complete
      if (progress >= 100) {
        setTimeout(() => {
          setDownloadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);
      }
    });

    p2pService.onFileReceivedCallback((file) => {
      console.log(`🎯 File received callback triggered:`, {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setDownloadedFiles(prev => [...prev, file]);
      
      // Show disconnecting status
      setIsDisconnecting(true);
      
      // Trigger download with better error handling
      try {
        const url = URL.createObjectURL(file);
        console.log(`🔗 Created object URL: ${url}`);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        console.log(`👆 Triggering download for: ${file.name}`);
        a.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log(`🧹 Cleaned up download elements for: ${file.name}`);
        }, 100);
        
        console.log(`✅ File "${file.name}" download triggered successfully! Disconnecting in 2 seconds...`);
      } catch (error) {
        console.error(`❌ Error triggering download for ${file.name}:`, error);
      }
    });

    return () => {
      p2pService.disconnect();
    };
  }, [p2pService]);

  // Use variables to avoid ESLint warnings
  React.useEffect(() => {
    console.log('Connection state:', connectionState, 'Sender ID:', senderId);
  }, [connectionState, senderId]);

  const handleConnect = async () => {
    if (!shareCode.trim()) {
      setError('Please enter a share code');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const deviceInfo = {
        name: navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Computer',
        type: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
      };

      await p2pService.joinRoom(shareCode.toUpperCase(), deviceInfo);
      // Connection success will be handled by the event handler
    } catch (err) {
      setError('Failed to connect. Please check the share code and try again.');
      setIsConnecting(false);
    }
  };

  const handleDownloadFile = (fileId: string) => {
    console.log('🔽 Download requested for file:', fileId, 'from sender:', senderId);
    
    if (!senderId) {
      console.error('❌ No sender ID available for download');
      setError('No sender connected. Please reconnect.');
      return;
    }
    
    console.log('📤 Requesting file from sender:', senderId);
    p2pService.requestFile(fileId, senderId);
  };

  const handleDisconnect = () => {
    p2pService.disconnect();
    setIsConnected(false);
    setAvailableFiles([]);
    setSenderInfo(null);
    setShareCode('');
    setDownloadProgress({});
    setConnectionState('disconnected');
  };

  return (
    <GradientBackground>
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: '1200px' 
      }}>
        <Typography variant="h3" style={{ 
          color: '#fff', 
          textAlign: 'center', 
          marginBottom: '30px',
          fontWeight: 'bold'
        }}>
          Receive Files
        </Typography>

        {!isConnected ? (
          <StyledCard>
            <CardContent>
              <Typography variant="h5" style={{ 
                color: '#fff', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Enter Share Code
              </Typography>
              
              <Typography variant="body1" style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                Ask the sender for their 6-digit share code
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <StyledTextField
                  fullWidth
                  label="Share Code"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123"
                  inputProps={{ maxLength: 6, style: { textAlign: 'center', fontSize: '18px' } }}
                />

                {error && (
                  <Alert severity="error" style={{ borderRadius: '10px' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  style={{
                    background: 'linear-gradient(45deg, #6FA3EF 30%, #FF6F61 90%)',
                    color: 'white',
                    padding: '12px 24px',
                    fontSize: '16px',
                    borderRadius: '10px',
                    marginTop: '10px'
                  }}
                >
                  {isConnecting ? (
                    <>
                      <CircularProgress size={20} style={{ marginRight: '10px', color: 'white' }} />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </Button>

                {isConnecting && (
                  <LinearProgress style={{ borderRadius: '5px', marginTop: '10px' }} />
                )}
              </Box>
            </CardContent>
          </StyledCard>
        ) : (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <div>
                    <Typography variant="h6" style={{ color: '#fff' }}>
                      {isDisconnecting ? 'Disconnecting...' : `Connected to: ${senderInfo?.name}`}
                    </Typography>
                    <Chip 
                      label={isDisconnecting ? 'Download Complete' : senderInfo?.deviceType} 
                      size="small" 
                      style={{ 
                        backgroundColor: isDisconnecting ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.2)', 
                        color: isDisconnecting ? '#4CAF50' : '#fff',
                        marginTop: '5px'
                      }} 
                    />
                  </div>
                  <Button
                    variant="outlined"
                    onClick={handleDisconnect}
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: '#fff'
                    }}
                  >
                    Disconnect
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>

            <Typography variant="h5" style={{ 
              color: '#fff', 
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              Available Files ({availableFiles.length})
            </Typography>

            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              width: '100%' 
            }}>
              {availableFiles.map((file) => (
                <div key={file.id} style={{ position: 'relative' }}>
                  <FileCard 
                    fileName={file.name} 
                    fileSize={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                    fileDate="Available now"
                  />
                  <Box 
                    position="absolute" 
                    bottom="10px" 
                    left="50%" 
                    style={{ transform: 'translateX(-50%)' }}
                  >
                    {downloadProgress[file.id] !== undefined ? (
                      <Box width="200px" textAlign="center">
                        <Typography variant="caption" style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                          Downloading: {Math.round(downloadProgress[file.id])}%
                        </Typography>
                        <Box 
                          width="100%" 
                          height="4px" 
                          bgcolor="rgba(255,255,255,0.3)" 
                          borderRadius="2px"
                        >
                          <Box 
                            width={`${downloadProgress[file.id]}%`} 
                            height="100%" 
                            bgcolor="#4CAF50" 
                            borderRadius="2px"
                            style={{ transition: 'width 0.3s ease' }}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleDownloadFile(file.id)}
                        style={{
                          background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                          color: 'white',
                          borderRadius: '20px'
                        }}
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                </div>
              ))}
            </div>

            {downloadedFiles.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" style={{ color: '#fff', marginBottom: '15px', textAlign: 'center' }}>
                  Downloaded Files ({downloadedFiles.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
                  {downloadedFiles.map((file, index) => (
                    <Chip 
                      key={index}
                      label={file.name}
                      style={{ 
                        backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                        color: '#4CAF50',
                        margin: '2px'
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </div>
        )}
      </div>
    </GradientBackground>
  );
};

export default Receive;