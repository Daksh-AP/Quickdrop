import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import Share from './pages/Share';
import GradientBackground from './components/GradientBackground';
import './styles/material-theme';

const App: React.FC = () => {
  return (
    <Router>
      <GradientBackground>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/share" component={Share} />
        </Switch>
      </GradientBackground>
    </Router>
  );
};

export default App;