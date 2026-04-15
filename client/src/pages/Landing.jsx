import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  getFlights, getPriceTrend, setFilters, setSelectedFlight, resetFlightState,
} from '../features/flightSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search, ArrowRightLeft, Plane, Calendar, User, ChevronDown,
  Radio, Shield, ChevronRight
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import AirportAutocomplete from '../components/AirportAutocomplete';
import FareCalendar from '../components/FareCalendar';
import FlightCard from '../components/FlightCard';
import useFlightSocket from '../hooks/useFlightSocket';

const TRIP_TYPES = [
  { id: 'one-way',     label: 'One Way' },
  { id: 'round-trip',  label: 'Round Trip' },
  { id: 'multi-city',  label: 'Multi-City' },
];

const Landing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const flightState = useSelector((state) => state.flights);
  const { results = [], isLoading = false, isPriceTrendLoading = false, filters = {} } = flightState || {};

  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const travelerRef = useRef(null);

  // Real-time socket connection
  const { liveUpdates } = useFlightSocket();

  useEffect(() => {
    return () => { dispatch(resetFlightState()); };
  }, [dispatch]);

  // Close traveler dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (travelerRef.current && !travelerRef.current.contains(e.target)) setShowTravelerDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = {
      origin: filters.origin, destination: filters.destination,
      date: filters.date, passengers: filters.passengers,
      cabinClass: filters.cabinClass, tripType: filters.tripType
    };
    dispatch(getFlights(params));
    if (filters.origin && filters.destination) {
      dispatch(getPriceTrend({ origin: filters.origin, destination: filters.destination }));
    }
  };

  const swapLocations = () => {
    dispatch(setFilters({ origin: filters.destination, destination: filters.origin }));
  };

  const onSelectFlight = (flight) => {
    // Landing page is unauthenticated, redirect to login
    navigate('/login', { state: { message: 'Sign in to book this flight' }});
  };

  const toggleExpand = (id) => {
    setExpandedFlightId(prev => prev === id ? null : id);
  };

  const tickerMessages = [
    ...liveUpdates.map(u => `🔴 Live: ${u.airline} — ${u.availableSeats} seats remaining at ₹${u.price?.toLocaleString('en-IN')}`),
    'Prices for BOM → DEL dropped 12% in the last hour',
    '🔥 High demand: 450 people looking at DEL → BOM right now',
    'BLR → PNQ dropped ₹500 just now',
    '⚡ TravelDesk Assured offers ₹0 cancellation on all premium tickets',
    '🔐 Your data is end-to-end encrypted on every booking',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-x-hidden relative selection:bg-white/10">
      <Helmet>
        <title>TravelDesk Pro | Premium Travel Logistics</title>
      </Helmet>

      {/* Animated Aurora Background Layer */}
      <motion.div 
        animate={{ 
          x: [0, 50, -30, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none"
      />

      {/* Top Navbar Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl w-full mx-auto">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            <span className="font-sans font-black text-black text-lg tracking-tighter">TD</span>
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight text-white">TravelDesk <span className="text-[10px] text-white/40 align-top ml-1">PRO</span></span>
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs font-black px-6 py-2">Create Identity</Link>
        </div>
      </header>

      {/* Live Ticker */}
      <div className="w-full border-b border-white/5 bg-black/40 backdrop-blur-md relative z-40 flex items-center py-2 overflow-hidden">
        <div className="flex items-center gap-2 px-6 z-10 bg-black shadow-[20px_0_20px_black] pr-4 shrink-0 border-r border-white/10">
          <Radio size={10} className="text-white fill-white animate-pulse" />
          <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Network Feed</span>
        </div>
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-100%' }}
          transition={{ ease: 'linear', duration: 40, repeat: Infinity }}
          className="flex items-center flex-nowrap"
        >
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i} className="text-[10px] font-bold text-textMuted uppercase tracking-widest mx-10 inline-block">
              {msg}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Hero & Search Context */}
      <main className="flex-1 relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col gap-16">
        
        {/* Hero Typography */}
        <div className="max-w-2xl text-center mx-auto space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="text-6xl md:text-8xl font-sans font-bold tracking-tightest leading-[0.9] silver-text"
          >
            Unlimited <br /> horizons.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="text-[#A1A1A1] text-lg font-light leading-relaxed max-w-lg mx-auto"
          >
            The enterprise standard for high-performance travel logistics. End-to-end intelligence mapped in real-time.
          </motion.p>
        </div>

        {/* Flight Search Module */}
        <motion.div
           initial={{ opacity: 0, y: 40, scale: 0.98 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ delay: 0.2, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
           className="w-full glass-card border border-white/10 p-8 pt-10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-100 pointer-events-none" />

          {/* Search Types */}
          <div className="flex items-center gap-1 mb-8">
            {TRIP_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => dispatch(setFilters({ tripType: type.id }))}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all
                  ${filters.tripType === type.id || (!filters.tripType && type.id === 'one-way')
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                    : 'text-white/60 border border-white/10 hover:border-white/30 hover:text-white'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Origin */}
              <div className="md:col-span-3 relative">
                <AirportAutocomplete
                  id="landing-origin"
                  label="From"
                  placeholder="City or IATA"
                  value={filters.origin}
                  icon={<Plane size={16} className="text-white/50" />}
                  onChange={(airport) => dispatch(setFilters({ origin: airport.iata || airport.city || '' }))}
                />
                <button
                  type="button"
                  onClick={swapLocations}
                  className="absolute -right-5 top-[50%] mt-2 z-20 w-10 h-10 flex items-center justify-center bg-black border border-white/20 rounded-full hover:border-white hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hidden md:flex text-white"
                  title="Swap"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-3">
                <AirportAutocomplete
                  id="landing-destination"
                  label="To"
                  placeholder="City or IATA"
                  value={filters.destination}
                  align="right"
                  icon={<Plane size={16} className="text-white/50 rotate-90" />}
                  onChange={(airport) => dispatch(setFilters({ destination: airport.iata || airport.city || '' }))}
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1">
                  <Calendar size={12} /> Departure
                </label>
                <input
                  type="date"
                  value={filters.date || ''}
                  onChange={(e) => dispatch(setFilters({ date: e.target.value }))}
                  className="input-field bg-white/5 border-white/10 w-full text-base py-3"
                />
              </div>

              {/* Travelers */}
              <div className="md:col-span-2 space-y-2 relative" ref={travelerRef}>
                <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1">
                  <User size={12} /> Travelers
                </label>
                <button
                  type="button"
                  onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                  className="input-field bg-white/5 border-white/10 w-full text-base py-[11px] flex items-center justify-between text-left"
                >
                  <span className="text-white">{filters.passengers || 1} Adult{filters.passengers > 1 ? 's' : ''}</span>
                  <ChevronDown size={16} className={`text-white/50 transition-transform ${showTravelerDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showTravelerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-3"
                    >
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Adults</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.max(1, (filters.passengers || 1) - 1) }))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-white hover:bg-white/10 text-white font-black text-xl transition-colors">−</button>
                        <span className="font-mono font-black text-xl w-6 text-center text-white">{filters.passengers || 1}</span>
                        <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.min(9, (filters.passengers || 1) + 1) }))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-white hover:bg-white/10 text-white font-black text-xl transition-colors">+</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Action */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-gray-200 h-[50px] rounded-xl flex items-center justify-center gap-3 group/btn transition-all font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <Search size={16} className="group-hover/btn:scale-110 transition-transform" />
                  Search
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Real-time Results Area */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full pb-20"
          >
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-sans font-bold text-white tracking-tight">Active Flights.</h2>
               <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/20">
                 <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                 <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Inventory</span>
               </div>
            </div>

            <div className="space-y-4">
              {results.slice(0, 5).map((flight, i) => (
                <FlightCard
                  key={flight._id}
                  flight={flight}
                  index={i}
                  isRecommendation={false}
                  onSelect={onSelectFlight}
                  isExpanded={expandedFlightId === flight._id}
                  onToggle={() => toggleExpand(flight._id)}
                  isLanding={true}
                />
              ))}
            </div>

            {results.length > 5 && (
              <div className="mt-8 text-center">
                 <button onClick={onSelectFlight} className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-white/20 pb-1">
                   View {results.length - 5} More Options
                 </button>
              </div>
            )}
          </motion.div>
        )}

        {isLoading && (
           <div className="w-full py-10 opacity-50">
              <SkeletonCard count={3} />
           </div>
        )}

      </main>

      {/* Footer minimal */}
      <footer className="border-t border-white/[0.05] py-8 text-center relative z-20 mt-auto">
        <p className="text-[10px] font-medium uppercase text-white/20 tracking-[0.2em]">
          TravelDesk PRO &copy; {new Date().getFullYear()} · Architecture v8.4.1
        </p>
      </footer>
    </div>
  );
};

export default Landing;
