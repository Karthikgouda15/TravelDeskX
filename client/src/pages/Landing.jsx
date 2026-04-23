import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  getFlights, getPriceTrend, setFilters, setSelectedFlight, resetFlightState,
} from '../features/flightSlice';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search, ArrowRightLeft, Plane, Calendar, User, ChevronDown,
  Radio, Shield, ChevronRight
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import AirportAutocomplete from '../components/AirportAutocomplete';
import FlightCard from '../components/FlightCard';
import useFlightSocket from '../hooks/useFlightSocket';

const TRIP_TYPES = [
  { id: 'one-way',     label: 'One Way' },
  { id: 'round-trip',  label: 'Round Trip' },
  { id: 'multi-city',  label: 'Multi-City' },
];

/* Simple Search Card */
const SimpleCard = ({ children }) => {
  return (
    <div className="relative z-30">
      <div className="w-full bg-[#111111]/80 backdrop-blur-xl p-10 rounded-[2rem] relative shadow-2xl border border-white/10">
        {children}
      </div>
    </div>
  );
};

const Landing = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const flightState = useSelector((state) => state.flights);
  const { results = [], isLoading = false, filters = {} } = flightState || {};

  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const travelerRef = useRef(null);
  const { liveUpdates } = useFlightSocket();

  useEffect(() => {
    return () => { dispatch(resetFlightState()); };
  }, [dispatch]);

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

  const onSelectFlight = () => {
    navigate('/login', { state: { message: 'Sign in to book this flight' }});
  };

  const toggleExpand = (id) => {
    setExpandedFlightId(prev => prev === id ? null : id);
  };

  const tickerMessages = [
    ...liveUpdates.map(u => `🔴 Live: ${u.airline} — ${u.availableSeats} seats remaining at ₹${u.price?.toLocaleString('en-IN')}`),
    'Prices for BOM → DEL dropped 12% in the last hour',
    '⚡ TravelDesk Assured offers ₹0 cancellation on all premium tickets',
    '🔐 Encryption enabled on all active bookings',
    'Global aviation APIs synchronizing in real-time',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#020202] overflow-x-hidden relative selection:bg-[#00D4C8]/30">
      <Helmet>
        <title>TravelDesk Pro | Next-Gen Aviation Intelligence</title>
      </Helmet>



      {/* Top Navbar Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-8 max-w-[1400px] w-full mx-auto">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <span className="font-sans font-black text-black text-xl tracking-tighter">TD</span>
          </div>
          <span className="font-sans font-bold text-3xl tracking-tight text-white group-hover:text-[#00D4C8] transition-colors duration-500">
            TravelDesk 
            <span className="text-[11px] text-white/40 align-top ml-1 tracking-[0.2em] font-mono">PRO</span>
          </span>
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/login" className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors relative group">
            Sign In
            <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-[#00D4C8] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </Link>
          <Link to="/register" className="relative group overflow-hidden bg-white text-black text-xs font-black px-8 py-3.5 rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <span className="relative z-10 uppercase tracking-widest">Create Identity</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-[#00D4C8]/20 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
        </div>
      </header>

      {/* Futuristic Ticker */}
      <div className="w-full border-y border-white/5 bg-[#050505]/80 backdrop-blur-xl relative z-40 flex items-center py-2.5 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2.5 px-8 z-10 bg-[#050505] shadow-[30px_0_30px_#050505] shrink-0 border-r border-white/5">
          <Radio size={12} className="text-[#00D4C8] fill-[#00D4C8] animate-pulse drop-shadow-[0_0_10px_rgba(0,212,200,0.8)]" />
          <span className="text-[10px] font-mono font-bold uppercase text-white/80 tracking-[0.3em]">Network Feed</span>
        </div>
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-100%' }}
          transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
          className="flex items-center flex-nowrap pl-4"
        >
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i} className="text-[11px] font-mono font-medium text-white/50 uppercase tracking-[0.15em] mx-12 inline-block whitespace-nowrap">
              {msg}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Hero Context */}
      <main className="flex-1 relative z-20 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex flex-col gap-20">
        
        {/* Typography */}
        <div className="text-center mx-auto space-y-8 max-w-4xl relative">
          <div className="absolute inset-0 bg-[#00D4C8] blur-[150px] opacity-10 rounded-full w-1/2 mx-auto pointer-events-none" />
          <h1 className="text-7xl md:text-[110px] font-sans font-black tracking-[-0.05em] leading-[0.85] text-white mix-blend-plus-lighter drop-shadow-2xl">
            Unlimited horizons.
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-white/60 text-xl font-light leading-relaxed max-w-2xl mx-auto tracking-wide"
          >
            The enterprise standard for high-performance travel logistics. <br className="hidden md:block"/> 
            End-to-end intelligence mapped in real-time.
          </motion.p>
        </div>

        {/* 3D Flight Search Module */}
        <motion.div
           initial={{ opacity: 0, y: 60, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ delay: 0.8, duration: 1.2, type: "spring", stiffness: 80, damping: 20 }}
        >
          <SimpleCard>
            <div className="flex items-center gap-2 mb-10 overflow-x-auto scrollbar-hide">
              {TRIP_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => dispatch(setFilters({ tripType: type.id }))}
                  className={`px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap
                    ${filters.tripType === type.id || (!filters.tripType && type.id === 'one-way')
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                      : 'text-white/50 border border-white/5 hover:border-white/20 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearch} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                {/* Origin */}
                <div className="md:col-span-3 relative group">
                  <div className="absolute inset-0 bg-[#00D4C8] blur-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"/>
                  <AirportAutocomplete
                    id="landing-origin"
                    label="From"
                    placeholder="City or IATA"
                    value={filters.origin}
                    icon={<Plane size={18} className="text-[#00D4C8]/80" />}
                    onChange={(airport) => dispatch(setFilters({ origin: airport.iata || airport.city || '' }))}
                  />
                  <button
                    type="button"
                    onClick={swapLocations}
                    className="absolute -right-6 top-[55%] z-20 w-12 h-12 flex items-center justify-center bg-[#111] border border-white/10 rounded-full hover:border-[#00D4C8] hover:text-[#00D4C8] text-white transition-all shadow-2xl hidden md:flex hover:scale-110 active:scale-95"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>

                {/* Destination */}
                <div className="md:col-span-3 relative group">
                  <div className="absolute inset-0 bg-[#FF6B35] blur-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"/>
                  <AirportAutocomplete
                    id="landing-destination"
                    label="To"
                    placeholder="City or IATA"
                    value={filters.destination}
                    align="right"
                    icon={<Plane size={18} className="text-[#FF6B35]/80 rotate-90" />}
                    onChange={(airport) => dispatch(setFilters({ destination: airport.iata || airport.city || '' }))}
                  />
                </div>

                {/* Date */}
                <div className="md:col-span-2 space-y-2 relative group">
                  <div className="absolute inset-0 bg-white blur-xl opacity-0 group-focus-within:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"/>
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] flex items-center gap-2 ml-2">
                    <Calendar size={12} className="text-white/60" /> Departure
                  </label>
                  <input
                    type="date"
                    value={filters.date || ''}
                    onChange={(e) => dispatch(setFilters({ date: e.target.value }))}
                    className="w-full px-5 py-[18px] bg-black/50 border border-white/10 rounded-2xl text-white outline-none focus:border-white/40 transition-all font-medium text-lg"
                  />
                </div>

                {/* Travelers */}
                <div className="md:col-span-2 space-y-2 relative" ref={travelerRef}>
                  <label className="text-[10px] uppercase font-bold text-white/40 tracking-[0.2em] flex items-center gap-2 ml-2">
                    <User size={12} className="text-white/60" /> Travelers
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                    className="w-full px-5 py-[18px] bg-black/50 border border-white/10 rounded-2xl text-white flex items-center justify-between text-left hover:border-white/30 transition-colors"
                  >
                    <span className="font-medium text-lg">{filters.passengers || 1} Adult{filters.passengers > 1 ? 's' : ''}</span>
                    <ChevronDown size={16} className={`text-white/40 transition-transform duration-300 ${showTravelerDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showTravelerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-3 w-56 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 p-5 backdrop-blur-xl"
                      >
                        <p className="text-[10px] font-bold uppercase text-white/30 tracking-[0.2em] mb-3">Occupancy</p>
                        <div className="flex items-center justify-between bg-black/50 rounded-xl p-2 border border-white/5">
                          <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.max(1, (filters.passengers || 1) - 1) }))}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors active:scale-95">−</button>
                          <span className="font-mono font-bold text-xl text-white">{filters.passengers || 1}</span>
                          <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.min(9, (filters.passengers || 1) + 1) }))}
                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors active:scale-95">+</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Action */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full h-[62px] relative group overflow-hidden bg-white rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D4C8]/10 to-transparent group-hover:translate-x-full duration-1000 transform -translate-x-full" />
                    <span className="text-black font-black uppercase tracking-[0.2em] text-[11px] relative z-10 flex items-center gap-2">
                       <Search size={16} strokeWidth={3} className="text-black group-hover:rotate-12 transition-transform duration-300" />
                       Search
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </SimpleCard>
        </motion.div>

        {/* Real-time Results Area */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full pb-20 relative z-20"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
               <div>
                 <h2 className="text-4xl font-sans font-black text-white tracking-tight leading-none mb-3">Live Inventory.</h2>
                 <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Matched {results.length} highly optimized routes</p>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4C8]/10 border border-[#00D4C8]/20 self-start">
                 <div className="w-2 h-2 rounded-full bg-[#00D4C8] shadow-[0_0_10px_#00D4C8] animate-pulse" />
                 <span className="text-[10px] font-bold uppercase text-[#00D4C8] tracking-widest">Real-Time Sync</span>
               </div>
            </div>

            <div className="space-y-4">
              {results.slice(0, 5).map((flight, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  key={flight._id}
                >
                  <FlightCard
                    flight={flight}
                    index={i}
                    isRecommendation={false}
                    onSelect={onSelectFlight}
                    isExpanded={expandedFlightId === flight._id}
                    onToggle={() => toggleExpand(flight._id)}
                    isLanding={true}
                  />
                </motion.div>
              ))}
            </div>

            {results.length > 5 && (
              <div className="mt-12 text-center">
                 <button onClick={onSelectFlight} className="relative group inline-flex items-center gap-3">
                   <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50 group-hover:text-white transition-colors duration-300 border-b border-white/20 pb-1 border-dotted">
                     Unlock {results.length - 5} More Enterprises Rates
                   </span>
                   <ChevronRight size={14} className="text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                 </button>
              </div>
            )}
          </motion.div>
        )}

        {isLoading && (
           <div className="w-full py-10 opacity-40">
              <SkeletonCard count={3} />
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-10 relative z-20 mt-auto bg-black/50 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-mono uppercase text-white/30 tracking-[0.2em]">
            TravelDesk PRO &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold uppercase text-white/20 tracking-widest hover:text-white/60 cursor-pointer transition-colors">Architecture v9.0</span>
            <span className="text-[10px] font-bold uppercase text-white/20 tracking-widest hover:text-white/60 cursor-pointer transition-colors">API Docs</span>
            <span className="text-[10px] font-bold uppercase text-white/20 tracking-widest hover:text-white/60 cursor-pointer transition-colors">Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
