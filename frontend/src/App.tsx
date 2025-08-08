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
      main: '#6FA3EF',
    },
    secondary: {
      main: '#FF6F61',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppBar position="static" style={{ background: 'linear-gradient(90deg, #6FA3EF 0%, #FF6F61 100%)' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                P2P File Sharing
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
