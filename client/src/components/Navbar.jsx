// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../features/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Compass, Briefcase, Train, Bus, Activity } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Flights', path: '/flights', icon: Compass },
    { name: 'Hotels', path: '/hotels', icon: Briefcase },
    { name: 'Trains', path: '/trains', icon: Train },
    { name: 'Buses', path: '/buses', icon: Bus },
    { name: 'Tracking', path: '/track', icon: Activity },
    { name: 'Itinerary', path: '/itinerary', icon: Compass },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Analytics', path: '/admin/analytics', icon: LayoutDashboard });
  }

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="font-sans font-black text-black text-sm tracking-tighter">TD</span>
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-white hidden sm:block">
              TravelDesk
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] font-medium tracking-tight transition-all duration-300 hover:text-white ${
                  location.pathname === link.path ? 'text-white' : 'text-[#A1A1A1]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[11px] font-medium text-white tracking-tight">{user.name}</p>
                  <p className="text-[10px] text-[#A1A1A1] font-medium uppercase tracking-widest leading-none mt-1">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-white/10 text-[#A1A1A1] hover:text-white transition-all"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-[13px] text-white hover:opacity-70 transition-opacity">Sign In</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-[#A1A1A1] hover:text-white"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-black border-b border-[#1A1A1A]"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 text-white font-medium text-lg tracking-tight"
                >
                  <link.icon size={20} className="text-[#A1A1A1]" />
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-[#1A1A1A]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 text-white font-medium text-lg tracking-tight"
                >
                  <LogOut size={20} className="text-[#A1A1A1]" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
