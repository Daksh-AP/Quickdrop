import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Share from './pages/Share';
import Receive from './pages/Receive';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0077BE', // Deep Ocean Blue
    },
    secondary: {
      main: '#00C4CC', // Turquoise
    },
    background: {
      default: '#F0F8FF', // Alice Blue
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E3A8A', // Navy Blue
      secondary: '#0369A1', // Sky Blue
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppBar position="static" style={{ background: 'linear-gradient(90deg, #0077BE 0%, #00C4CC 100%)' }}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                {/* AirDrop-style Logo */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #5BA7FF 0%, #0066CC 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 2,
                    position: 'relative'
                  }}
                >
                  {/* Upload Arrow */}
                  <Box
                    sx={{
                      width: 0,
                      height: 0,
                      borderLeft: '4px solid transparent',
                      borderRight: '4px solid transparent',
                      borderBottom: '6px solid white',
                      position: 'absolute',
                      top: '6px'
                    }}
                  />
                  <Box
                    sx={{
                      width: '2px',
                      height: '12px',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '10px'
                    }}
                  />
                  {/* Small circle at bottom */}
                  <Box
                    sx={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      position: 'absolute',
                      bottom: '4px'
                    }}
                  />
                </Box>
                <Typography variant="h6" component="div">
                  Quickdrop
                </Typography>
              </Box>
              <Box>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/share">
                  Share
                </Button>
                <Button color="inherit" component={Link} to="/receive">
                  Receive
                </Button>
              </Box>
            </Toolbar>
          </AppBar>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/share" element={<Share />} />
            <Route path="/receive" element={<Receive />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
