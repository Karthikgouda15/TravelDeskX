// src/App.jsx
import { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { getMe } from './features/authSlice';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Checkout from './pages/Checkout';
import MyBookings from './pages/MyBookings';
import Itinerary from './pages/Itinerary';
import AdminAnalytics from './pages/AdminAnalytics';
import Trains from './pages/Trains';
import Buses from './pages/Buses';
import StatusTracker from './pages/StatusTracker';

const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-black relative overflow-hidden">
    <div className="noise-overlay" />
    <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
  </div>
);

const AmbientCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 100, stiffness: 200, restDelta: 0.001 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 250);
      mouseY.set(e.clientY - 250);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      style={{
        left: smoothX,
        top: smoothY,
      }}
      className="fixed w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none z-[9998] mix-blend-screen"
    />
  );
};

function App() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (isLoading) return <LoadingFallback />;

  return (
    <HelmetProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-black relative selection:bg-white/20">
            {/* Global Pro Layers */}
            <div className="noise-overlay" />
            <AmbientCursor />
            
            {isAuthenticated && <Navbar />}

            <Routes>
                {/* Public / Auth */}
                <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/flights" />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/flights" />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/flights" />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/flights" element={<Flights />} />
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/itinerary" element={<Itinerary />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/trains" element={<Trains />} />
                  <Route path="/buses" element={<Buses />} />
                  <Route path="/track" element={<StatusTracker />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </HelmetProvider>
  );
}

export default App;
