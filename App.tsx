import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TripDashboard from './components/TripDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/trip/:tripCode" element={<TripDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
