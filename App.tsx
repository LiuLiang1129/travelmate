import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TripDashboard from './components/TripDashboard';
import Auth from './components/Auth';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/trip/:tripCode" element={<TripDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
