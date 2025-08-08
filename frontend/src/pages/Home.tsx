import React from 'react';
import { Button, Typography, Box, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';
import SendIcon from '@mui/icons-material/Send';
import GetAppIcon from '@mui/icons-material/GetApp';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

const StyledCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '20px',
  margin: '10px',
  minHeight: '200px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
  },
});

const FeatureCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(5px)',
  borderRadius: '15px',
  padding: '15px',
  margin: '10px',
  textAlign: 'center',
  minHeight: '150px',
});

const Home: React.FC = () => {
    const navigate = useNavigate();

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
                <Typography variant="h2" style={{ 
                    color: '#fff', 
                    textAlign: 'center', 
                    marginBottom: '20px',
                    fontWeight: 'bold'
                }}>
                    Quickdrop
                </Typography>
                
                <Typography variant="h6" style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    textAlign: 'center', 
                    marginBottom: '40px',
                    maxWidth: '600px'
                }}>
                    Share files directly between devices without uploading to the cloud. 
                    Fast, secure, and private file transfers.
                </Typography>

                {/* Main Action Cards */}
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={3} style={{ marginBottom: '40px', maxWidth: '800px' }}>
                    <Box flex="1" minWidth="350px">
                        <StyledCard>
                            <CardContent style={{ textAlign: 'center' }}>
                                <SendIcon style={{ fontSize: '60px', color: '#FF6F61', marginBottom: '15px' }} />
                                <Typography variant="h5" style={{ color: '#fff', marginBottom: '15px' }}>
                                    Share Files
                                </Typography>
                                <Typography variant="body1" style={{ 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    marginBottom: '20px' 
                                }}>
                                    Select files from your device and generate a share code for others to connect
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/share')}
                                    style={{
                                        background: 'linear-gradient(45deg, #FF6F61 30%, #FF8A80 90%)',
                                        color: 'white',
                                        padding: '12px 30px',
                                        fontSize: '16px',
                                        borderRadius: '25px'
                                    }}
                                >
                                    Start Sharing
                                </Button>
                            </CardContent>
                        </StyledCard>
                    </Box>
                    
                    <Box flex="1" minWidth="350px">
                        <StyledCard>
                            <CardContent style={{ textAlign: 'center' }}>
                                <GetAppIcon style={{ fontSize: '60px', color: '#6FA3EF', marginBottom: '15px' }} />
                                <Typography variant="h5" style={{ color: '#fff', marginBottom: '15px' }}>
                                    Receive Files
                                </Typography>
                                <Typography variant="body1" style={{ 
                                    color: 'rgba(255, 255, 255, 0.8)', 
                                    marginBottom: '20px' 
                                }}>
                                    Enter a share code to connect to someone's device and download their files
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/receive')}
                                    style={{
                                        background: 'linear-gradient(45deg, #6FA3EF 30%, #90CAF9 90%)',
                                        color: 'white',
                                        padding: '12px 30px',
                                        fontSize: '16px',
                                        borderRadius: '25px'
                                    }}
                                >
                                    Connect & Download
                                </Button>
                            </CardContent>
                        </StyledCard>
                    </Box>
                </Box>

                {/* Features */}
                <Typography variant="h4" style={{ 
                    color: '#fff', 
                    textAlign: 'center', 
                    marginBottom: '30px',
                    fontWeight: 'bold'
                }}>
                    Why Choose Quickdrop?
                </Typography>

                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2} style={{ maxWidth: '900px' }}>
                    <Box flex="1" minWidth="200px">
                        <FeatureCard>
                            <CardContent>
                                <SecurityIcon style={{ fontSize: '40px', color: '#4CAF50', marginBottom: '10px' }} />
                                <Typography variant="h6" style={{ color: '#fff', marginBottom: '10px' }}>
                                    Secure
                                </Typography>
                                <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Direct device-to-device transfer with no cloud storage
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Box>
                    
                    <Box flex="1" minWidth="200px">
                        <FeatureCard>
                            <CardContent>
                                <SpeedIcon style={{ fontSize: '40px', color: '#FF9800', marginBottom: '10px' }} />
                                <Typography variant="h6" style={{ color: '#fff', marginBottom: '10px' }}>
                                    Fast
                                </Typography>
                                <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Transfer at your network speed without upload limits
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Box>
                    
                    <Box flex="1" minWidth="200px">
                        <FeatureCard>
                            <CardContent>
                                <Typography style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</Typography>
                                <Typography variant="h6" style={{ color: '#fff', marginBottom: '10px' }}>
                                    Private
                                </Typography>
                                <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Your files never leave your local network
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Box>
                    
                    <Box flex="1" minWidth="200px">
                        <FeatureCard>
                            <CardContent>
                                <Typography style={{ fontSize: '40px', marginBottom: '10px' }}>📱</Typography>
                                <Typography variant="h6" style={{ color: '#fff', marginBottom: '10px' }}>
                                    Cross-Platform
                                </Typography>
                                <Typography variant="body2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Works between phones, tablets, and computers
                                </Typography>
                            </CardContent>
                        </FeatureCard>
                    </Box>
                </Box>

                <Box mt={4} textAlign="center">
                    <Typography variant="body1" style={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxWidth: '600px'
                    }}>
                        <strong>How it works:</strong> One device shares files and gets a 6-digit code. 
                        The other device enters this code to connect and download the files directly.
                    </Typography>
                </Box>
            </div>
        </GradientBackground>
    );
};

export default Home;