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

// Lazy Loaded Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Flights = lazy(() => import('./pages/Flights'));
const Hotels = lazy(() => import('./pages/Hotels'));
const Checkout = lazy(() => import('./pages/Checkout'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const Trains = lazy(() => import('./pages/Trains'));
const Buses = lazy(() => import('./pages/Buses'));
const StatusTracker = lazy(() => import('./pages/StatusTracker'));

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

            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
          </div>
        </Router>
      </SocketProvider>
    </HelmetProvider>
  );
}

export default App;
