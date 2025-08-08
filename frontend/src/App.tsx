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
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Quickdrop
              </Typography>
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
