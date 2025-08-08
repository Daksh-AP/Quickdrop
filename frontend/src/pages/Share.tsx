import React, { useState, useEffect } from 'react';
import FloatingActionButton from '../components/FloatingActionButton';
import GradientBackground from '../components/GradientBackground';
import FileCard from '../components/FileCard';
import { P2PService, ConnectedDevice } from '../services/P2PService';
import { 
  Button, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Chip,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';

const StyledCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '20px',
  margin: '20px',
  minWidth: '400px',
  maxWidth: '600px',
});

const ShareCodeBox = styled(Box)({
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '15px',
  padding: '20px',
  textAlign: 'center',
  margin: '10px 0',
});

interface SharedFile {
  id: string;
  name: string;
  size: string;
  date: string;
  file: File;
}

const Share: React.FC = () => {
    const [files, setFiles] = useState<SharedFile[]>([]);
    const [shareCode, setShareCode] = useState<string>('');
    const [isSharing, setIsSharing] = useState(false);
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
    const [copySuccess, setCopySuccess] = useState(false);
    const [connectionState, setConnectionState] = useState<string>('disconnected');
    const [p2pService] = useState(() => P2PService.getInstance());
    const [transferProgress, setTransferProgress] = useState<{[key: string]: number}>({});

    useEffect(() => {
        let isActive = true;

        // Initialize P2P service
        const initializeService = async () => {
            try {
                await p2pService.initialize();
                
                if (!isActive) return; // Component unmounted during initialization
                
                // Setup P2P service event handlers
                p2pService.onConnectionStateChanged((state) => {
                    if (!isActive) return;
                    setConnectionState(state);
                    if (state === 'room-created') {
                        setIsSharing(true);
                        setIsCreatingRoom(false);
                    }
                });

                p2pService.onDeviceConnectedCallback((device) => {
                    if (!isActive) return;
                    setConnectedDevices(prev => [...prev, device]);
                });

                p2pService.onDeviceDisconnectedCallback((deviceId) => {
                    if (!isActive) return;
                    setConnectedDevices(prev => prev.filter(d => d.id !== deviceId));
                });

                p2pService.onTransferProgressCallback((fileId, progress) => {
                    if (!isActive) return;
                    setTransferProgress(prev => ({ ...prev, [fileId]: progress }));
                });
            } catch (error) {
                console.error('Failed to initialize P2P service:', error);
            }
        };

        initializeService();

        return () => {
            isActive = false;
            // Don't disconnect here as other components might be using the service
        };
    }, [p2pService]);

    const handleFileUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.files) {
                const newFiles = Array.from(target.files).map((file, index) => ({
                    id: `file_${Date.now()}_${index}`,
                    name: file.name,
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    date: new Date().toLocaleDateString(),
                    file: file
                }));
                setFiles(prev => [...prev, ...newFiles]);
            }
        };
        input.click();
    };

    const handleStartSharing = async () => {
        if (files.length === 0) return;
        
        console.log('🚀 Starting to share files...');
        console.log('🔌 P2P Service connected:', p2pService.isConnected());
        console.log('🆔 Socket ID:', p2pService.getSocketId());
        
        setIsCreatingRoom(true);
        
        try {
            // Wait a bit if not connected
            if (!p2pService.isConnected()) {
                console.log('⏳ Waiting for connection...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                console.log('🔌 P2P Service connected after wait:', p2pService.isConnected());
            }

            const deviceInfo = {
                name: navigator.platform.includes('Win') ? 'Windows PC' : 
                      navigator.platform.includes('Mac') ? 'Mac' : 'Computer',
                type: 'Desktop'
            };

            console.log('📱 Device info:', deviceInfo);
            console.log('📁 Files to share:', files.length);

            const roomId = await p2pService.createRoom(deviceInfo);
            console.log('🎉 Room created successfully:', roomId);
            setShareCode(roomId);
            
            // Update files in P2P service
            const fileObjects = files.map(f => f.file);
            p2pService.updateFiles(fileObjects);
            console.log('📤 Files updated in P2P service');
            
        } catch (error) {
            console.error('❌ Failed to create room:', error);
            setIsCreatingRoom(false);
            // Show error to user
            alert(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleStopSharing = () => {
        p2pService.disconnect();
        setIsSharing(false);
        setShareCode('');
        setConnectedDevices([]);
        setTransferProgress({});
        setConnectionState('disconnected');
    };

    const handleCopyShareCode = async () => {
        try {
            await navigator.clipboard.writeText(shareCode);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy share code');
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        
        // Update P2P service with new file list
        if (isSharing) {
            const remainingFiles = files.filter(f => f.id !== fileId).map(f => f.file);
            p2pService.updateFiles(remainingFiles);
        }
    };

    return (
        <GradientBackground>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
                <Typography variant="h3" style={{ 
                    color: '#fff', 
                    textAlign: 'center', 
                    marginBottom: '30px',
                    fontWeight: 'bold'
                }}>
                    Share Your Files
                </Typography>
                
                {/* Share Status Card */}
                {isSharing && (
                    <StyledCard>
                        <CardContent>
                            <Typography variant="h6" style={{ color: '#fff', marginBottom: '15px', textAlign: 'center' }}>
                                🚀 Now Sharing!
                            </Typography>
                            
                            <ShareCodeBox>
                                <Typography variant="h4" style={{ 
                                    color: '#333', 
                                    fontWeight: 'bold', 
                                    letterSpacing: '4px',
                                    marginBottom: '10px'
                                }}>
                                    {shareCode}
                                </Typography>
                                <Typography variant="body2" style={{ color: '#666', marginBottom: '15px' }}>
                                    Share this code with the receiver
                                </Typography>
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <Tooltip title={copySuccess ? "Copied!" : "Copy code"}>
                                        <IconButton onClick={handleCopyShareCode} style={{ color: '#6FA3EF' }}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Show QR Code">
                                        <IconButton style={{ color: '#6FA3EF' }}>
                                            <QrCodeIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </ShareCodeBox>

                            {/* Connected Devices */}
                            {connectedDevices.length > 0 && (
                                <Box mt={2}>
                                    <Typography variant="subtitle1" style={{ color: '#fff', marginBottom: '10px' }}>
                                        Connected Devices ({connectedDevices.length})
                                    </Typography>
                                    {connectedDevices.map(device => (
                                        <Box key={device.id} display="flex" alignItems="center" gap={1} mb={1}>
                                            <PersonIcon style={{ color: '#4CAF50' }} />
                                            <Typography style={{ color: '#fff' }}>
                                                {device.deviceInfo.name}
                                            </Typography>
                                            <Chip 
                                                label={device.deviceInfo.type} 
                                                size="small" 
                                                style={{ 
                                                    backgroundColor: 'rgba(76, 175, 80, 0.2)', 
                                                    color: '#4CAF50' 
                                                }} 
                                            />
                                            <Typography variant="caption" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Connected at {device.connectedAt}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            <Button
                                variant="outlined"
                                onClick={handleStopSharing}
                                style={{
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    color: '#fff',
                                    marginTop: '15px',
                                    width: '100%'
                                }}
                            >
                                Stop Sharing
                            </Button>
                        </CardContent>
                    </StyledCard>
                )}

                {copySuccess && (
                    <Alert severity="success" style={{ marginBottom: '20px', borderRadius: '10px' }}>
                        Share code copied to clipboard!
                    </Alert>
                )}
                
                {/* Files Section */}
                {files.length === 0 ? (
                    <Box textAlign="center" mb={4}>
                        <Typography variant="h6" style={{ color: '#fff', marginBottom: '20px' }}>
                            No files selected yet
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={handleFileUpload}
                            style={{ 
                                background: 'linear-gradient(45deg, #FF4081 30%, #FF80AB 90%)',
                                color: 'white',
                                padding: '12px 24px',
                                fontSize: '16px',
                                borderRadius: '10px'
                            }}
                        >
                            Select Files to Share
                        </Button>
                    </Box>
                ) : (
                    <div style={{ width: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5" style={{ color: '#fff' }}>
                                Selected Files ({files.length})
                            </Typography>
                            {!isSharing && (
                                <Button
                                    variant="contained"
                                    onClick={handleStartSharing}
                                    disabled={isCreatingRoom}
                                    style={{
                                        background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)',
                                        color: 'white',
                                        padding: '10px 20px',
                                        borderRadius: '10px'
                                    }}
                                >
                                    {isCreatingRoom ? (
                                        <>
                                            <CircularProgress size={20} style={{ marginRight: '10px', color: 'white' }} />
                                            Creating Room...
                                        </>
                                    ) : (
                                        'Start Sharing'
                                    )}
                                </Button>
                            )}
                        </Box>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            {files.map((file) => (
                                <div key={file.id} style={{ position: 'relative' }}>
                                    <FileCard 
                                        fileName={file.name} 
                                        fileSize={file.size} 
                                        fileDate={file.date}
                                    />
                                    {!isSharing && (
                                        <Button
                                            size="small"
                                            onClick={() => removeFile(file.id)}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                minWidth: '30px',
                                                width: '30px',
                                                height: '30px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(244, 67, 54, 0.8)',
                                                color: 'white'
                                            }}
                                        >
                                            ×
                                        </Button>
                                    )}
                                    {transferProgress[file.id] !== undefined && (
                                        <Box 
                                            position="absolute" 
                                            bottom="10px" 
                                            left="50%" 
                                            style={{ transform: 'translateX(-50%)' }}
                                        >
                                            <Box width="200px" textAlign="center">
                                                <Typography variant="caption" style={{ color: '#fff', marginBottom: '5px', display: 'block' }}>
                                                    Sending: {Math.round(transferProgress[file.id])}%
                                                </Typography>
                                                <Box 
                                                    width="100%" 
                                                    height="4px" 
                                                    bgcolor="rgba(255,255,255,0.3)" 
                                                    borderRadius="2px"
                                                >
                                                    <Box 
                                                        width={`${transferProgress[file.id]}%`} 
                                                        height="100%" 
                                                        bgcolor="#4CAF50" 
                                                        borderRadius="2px"
                                                        style={{ transition: 'width 0.3s ease' }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <FloatingActionButton onClick={handleFileUpload} />
            </div>
        </GradientBackground>
    );
};

export default Share;