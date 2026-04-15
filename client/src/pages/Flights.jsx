// src/pages/Flights.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  getFlights, getPriceTrend, setFilters, setSelectedFlight, resetFlightState,
} from '../features/flightSlice';
import { setCheckoutData } from '../features/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search, SlidersHorizontal, ArrowRight, Plane, Clock, Shield,
  ArrowRightLeft, TrendingDown, TrendingUp, Users, Zap, Info, ChevronRight,
  Calendar, User, ChevronDown, X, Wifi, BriefcaseBusiness, AlertTriangle,
  Radio, BarChart2, Armchair, Receipt, HardDrive, Luggage
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import StatusBadge from '../components/StatusBadge';
import SeatMapModal from '../components/SeatMapModal';
import AirportAutocomplete from '../components/AirportAutocomplete';
import FareCalendar from '../components/FareCalendar';
import FlightFilters from '../components/FlightFilters';
import useFlightSocket from '../hooks/useFlightSocket';
import FlightCard from '../components/FlightCard';

// ─── Trip Type Tab ───────────────────────────────────────────────────────────
const TRIP_TYPES = [
  { id: 'one-way',     label: 'One Way' },
  { id: 'round-trip',  label: 'Round Trip' },
  { id: 'multi-city',  label: 'Multi-City' },
];

const FARE_TYPES = [
  { id: 'regular',       label: 'Regular' },
  { id: 'student',       label: 'Student' },
  { id: 'armed-forces',  label: 'Armed Forces' },
  { id: 'senior',        label: 'Senior Citizen' },
];

const SORT_OPTIONS = [
  { id: 'price-asc',    label: 'Cheapest' },
  { id: 'duration-asc', label: 'Fastest' },
  { id: 'departure-asc', label: 'Departure' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sortFlights = (flights, sortBy) => {
  const f = [...flights];
  switch (sortBy) {
    case 'price-asc':     return f.sort((a, b) => a.price - b.price);
    case 'price-desc':    return f.sort((a, b) => b.price - a.price);
    case 'duration-asc':  return f.sort((a, b) => a.duration - b.duration);
    case 'departure-asc': return f.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    default: return f;
  }
};


// ─── Main Component ──────────────────────────────────────────────────────────
const Flights = () => {
  const dispatch = useDispatch();
  const flightState = useSelector((state) => state.flights);
  const { results = [], recommendations = [], priceTrend = [], isLoading = false, isPriceTrendLoading = false, filters = {} } = flightState || {};

  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [showTravelerDropdown, setShowTravelerDropdown] = useState(false);
  const [expandedFlightId, setExpandedFlightId] = useState(null);
  const travelerRef = useRef(null);

  // Real-time socket connection
  const { liveUpdates } = useFlightSocket();

  // Sync URL params on mount
  useEffect(() => {
    const origin      = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date        = searchParams.get('date');
    const passengers  = searchParams.get('passengers');
    if (origin || destination || date || passengers) {
      dispatch(setFilters({
        origin:      (origin || '').toUpperCase(),
        destination: (destination || '').toUpperCase(),
        date:        date || '',
        passengers:  Number(passengers) || 1,
      }));
    }
    return () => { dispatch(resetFlightState()); };
  }, [dispatch, searchParams]);

  // Auto-search when core params change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (filters.origin || filters.destination) {
      const params = {
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        passengers: filters.passengers,
        cabinClass: filters.cabinClass,
        sort: filters.sortBy,
        priceMax: filters.priceMax,
        stops: filters.stops,
        airlines: filters.airlines,
        departureSlots: filters.departureSlots,
      };
      dispatch(getFlights(params));
    }
  // Stringify arrays to give React a stable comparison value
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.origin, filters.destination, filters.date, filters.passengers,
    filters.sortBy, filters.priceMax, filters.cabinClass,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(filters.stops),
    JSON.stringify(filters.airlines),
    JSON.stringify(filters.departureSlots),
  ]);

  // Load price trend when route changes
  useEffect(() => {
    if (filters.origin && filters.destination) {
      dispatch(getPriceTrend({ origin: filters.origin, destination: filters.destination }));
    }
  }, [dispatch, filters.origin, filters.destination]);

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
      cabinClass: filters.cabinClass, sort: filters.sortBy,
      priceMax: filters.priceMax, stops: filters.stops,
      airlines: filters.airlines, departureSlots: filters.departureSlots,
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
    dispatch(setSelectedFlight(flight));
    setIsSeatModalOpen(true);
  };

  const toggleExpand = (id) => {
    setExpandedFlightId(prev => prev === id ? null : id);
  };

  const sortedResults = sortFlights(results, filters.sortBy || 'price-asc');

  // Live ticker messages — merge static + real-time socket updates
  const tickerMessages = [
    ...liveUpdates.map(u => `🔴 Live: ${u.airline} — ${u.availableSeats} seats remaining at ₹${u.price?.toLocaleString('en-IN')}`),
    'Prices for BOM → DEL dropped 12% in the last hour',
    '🔥 High demand: 450 people looking at DEL → BOM right now',
    'BLR → PNQ dropped ₹500 just now',
    '⚡ TravelDesk Assured offers ₹0 cancellation on all premium tickets',
    '🔐 Your data is end-to-end encrypted on every booking',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>Search Flights | TravelDesk</title>
        <meta name="description" content="Find and book the best enterprise flight deals across the globe with real-time fare intelligence." />
      </Helmet>

      {/* ── Live Ticker ────────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden bg-accent/5 border-b border-accent/10 py-1.5 flex items-center whitespace-nowrap hidden md:flex mb-6 rounded-xl">
        <div className="flex items-center gap-2 px-4 z-10 bg-background/80 pr-4 border-r border-accent/20 shrink-0">
          <Radio size={10} className="text-accent fill-accent animate-pulse" />
          <span className="text-[9px] font-black uppercase text-accent tracking-[0.2em]">Live Feed</span>
        </div>
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-100%' }}
          transition={{ ease: 'linear', duration: 35, repeat: Infinity }}
          className="flex items-center flex-nowrap"
        >
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i} className="text-[10px] font-bold text-textMuted uppercase tracking-widest mx-10 inline-block">
              {msg}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Hero Search Card ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="hero-header mb-6 p-8 relative group"
      >
        <div className="absolute inset-0 bg-animated-grid opacity-10 group-hover:opacity-20 transition-opacity" />

        <div className="relative z-10 space-y-6">
          {/* Title */}
          <div>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-heading font-black tracking-tight"
            >
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Flight Intelligence</span>
            </motion.h1>
            <p className="text-textMuted text-sm mt-1.5 font-medium">AI fare predictions · Real-time availability · Enterprise-grade booking</p>
          </div>

          {/* Trip Type Tabs */}
          <div className="flex items-center gap-1">
            {TRIP_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => dispatch(setFilters({ tripType: type.id }))}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all
                  ${filters.tripType === type.id
                    ? 'bg-accent text-background shadow-[0_0_12px_rgba(0,212,200,0.3)]'
                    : 'text-textMuted border border-white/10 hover:border-white/25 hover:text-white'
                  }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

              {/* Origin */}
              <div className="md:col-span-3 relative">
                <AirportAutocomplete
                  id="flight-origin"
                  label="From"
                  placeholder="City or IATA (e.g. DEL)"
                  value={filters.origin}
                  icon={<Plane size={16} className="text-accent/50" />}
                  onChange={(airport) => dispatch(setFilters({ origin: airport.iata || airport.city || '' }))}
                />
                {/* Swap Button */}
                <button
                  type="button"
                  onClick={swapLocations}
                  className="absolute -right-4 top-[50%] mt-2 z-20 w-8 h-8 flex items-center justify-center bg-surface border border-accent/20 rounded-full hover:border-accent hover:bg-accent/10 transition-all shadow-lg hidden md:flex"
                  title="Swap"
                >
                  <ArrowRightLeft size={13} className="text-accent" />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-3">
                <AirportAutocomplete
                  id="flight-destination"
                  label="To"
                  placeholder="City or IATA (e.g. BOM)"
                  value={filters.destination}
                  align="right"
                  icon={<Plane size={16} className="text-accent/50 rotate-90" />}
                  onChange={(airport) => dispatch(setFilters({ destination: airport.iata || airport.city || '' }))}
                />
              </div>

              {/* Departure Date */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] flex items-center gap-1">
                  <Calendar size={10} /> Departure
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => dispatch(setFilters({ date: e.target.value }))}
                  className="input-field bg-white/5 border-white/10 w-full text-sm"
                />
              </div>

              {/* Return Date (round trip only) */}
              <AnimatePresence>
                {filters.tripType === 'round-trip' && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="md:col-span-2 space-y-1.5 overflow-hidden"
                  >
                    <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] flex items-center gap-1">
                      <Calendar size={10} /> Return
                    </label>
                    <input
                      type="date"
                      value={filters.returnDate}
                      min={filters.date}
                      onChange={(e) => dispatch(setFilters({ returnDate: e.target.value }))}
                      className="input-field bg-white/5 border-white/10 w-full text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Travelers + Cabin */}
              <div className={`${filters.tripType === 'round-trip' ? 'md:col-span-1' : 'md:col-span-2'} space-y-1.5 relative`} ref={travelerRef}>
                <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] flex items-center gap-1">
                  <User size={10} /> Travelers
                </label>
                <button
                  type="button"
                  onClick={() => setShowTravelerDropdown(!showTravelerDropdown)}
                  className="input-field bg-white/5 border-white/10 w-full text-sm flex items-center justify-between"
                >
                  <span>{filters.passengers || 1} Adult{filters.passengers > 1 ? 's' : ''}</span>
                  <ChevronDown size={14} className={`text-textMuted transition-transform ${showTravelerDropdown ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showTravelerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-1 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 p-3 space-y-2"
                    >
                      <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-2">Adults</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.max(1, (filters.passengers || 1) - 1) }))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-accent text-white font-black text-lg">−</button>
                        <span className="font-mono font-black text-lg w-6 text-center">{filters.passengers || 1}</span>
                        <button type="button" onClick={() => dispatch(setFilters({ passengers: Math.min(9, (filters.passengers || 1) + 1) }))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-accent text-white font-black text-lg">+</button>
                      </div>
                      <div className="pt-2 border-t border-white/8">
                        <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-2">Cabin Class</p>
                        {['economy', 'business', 'first'].map(cls => (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => { dispatch(setFilters({ cabinClass: cls })); setShowTravelerDropdown(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize font-semibold transition-colors mb-1
                              ${filters.cabinClass === cls ? 'bg-accent/15 text-accent border border-accent/30' : 'hover:bg-white/5 text-textMuted'}`}
                          >
                            {cls}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Button */}
              <div className={`${filters.tripType === 'round-trip' ? 'md:col-span-1' : 'md:col-span-2'} flex items-end`}>
                <button
                  type="submit"
                  className="btn-primary w-full h-[52px] flex items-center justify-center gap-2 group/btn"
                >
                  <Search size={18} className="group-hover/btn:scale-110 transition-transform" />
                  <span className="uppercase tracking-[0.1em] font-black text-xs hidden sm:inline">Search</span>
                </button>
              </div>
            </div>

            {/* Fare Type Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black text-textMuted uppercase tracking-widest hidden sm:inline">Special Fares:</span>
              {FARE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => dispatch(setFilters({ fareType: type.id }))}
                  className={`text-[9px] font-black uppercase tracking-[0.12em] py-1 px-3 border rounded-lg transition-all
                    ${filters.fareType === type.id
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-white/10 text-textMuted hover:border-white/25'
                    }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </form>

          {/* Fare Calendar */}
          {(filters.origin && filters.destination) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart2 size={12} className="text-accent" />
                <p className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Fare Calendar — Next 14 Days</p>
              </div>
              <FareCalendar
                priceTrend={priceTrend}
                selectedDate={filters.date}
                onSelectDate={(dateStr) => dispatch(setFilters({ date: dateStr }))}
                isLoading={isPriceTrendLoading}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <aside className={`lg:w-72 lg:shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <FlightFilters />
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          {/* Results header + sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-black uppercase text-textMuted hover:border-accent/30 hover:text-white transition-all lg:hidden"
              >
                <SlidersHorizontal size={12} />
                Filters
              </button>
              <p className="text-sm text-textMuted font-bold uppercase tracking-widest">
                {isLoading ? 'Scanning skies…' : `${sortedResults.length} flight${sortedResults.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[9px] font-black uppercase text-accent">Live</span>
              </div>
            </div>

            {/* Sort tabs */}
            <div className="flex items-center gap-1 bg-white/3 border border-white/8 rounded-xl p-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => dispatch(setFilters({ sortBy: opt.id }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                    ${filters.sortBy === opt.id
                      ? 'bg-accent text-background shadow-[0_0_10px_rgba(0,212,200,0.3)]'
                      : 'text-textMuted hover:text-white'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <SkeletonCard count={4} />
            ) : sortedResults.length > 0 ? (
              sortedResults.map((flight, i) => (
                <FlightCard
                  key={flight._id}
                  flight={flight}
                  index={i}
                  isRecommendation={false}
                  onSelect={onSelectFlight}
                  isExpanded={expandedFlightId === flight._id}
                  onToggle={() => toggleExpand(flight._id)}
                />
              ))
            ) : recommendations.length > 0 ? (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card text-center py-8 border-accent/20 bg-accent/5"
                >
                  <p className="text-xs font-bold text-accent uppercase tracking-widest">No flights on exact date</p>
                  <h3 className="text-lg font-heading font-black mt-1">Recommended Nearby Dates</h3>
                  <p className="text-textMuted text-[10px] uppercase font-black mt-1">Showing available flights ±3 days from your selected date</p>
                </motion.div>
                {recommendations.map((flight, i) => (
                  <FlightCard key={flight._id} flight={flight} index={i} isRecommendation={true} onSelect={onSelectFlight} isExpanded={expandedFlightId === flight._id} onToggle={() => toggleExpand(flight._id)} />
                ))}
              </div>
            ) : (
              <div className="space-y-10 py-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card text-center py-14 border-dashed border-white/10"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-textMuted" />
                  </div>
                  <h3 className="text-lg font-heading font-black mb-1">No flights found</h3>
                  <p className="text-textMuted text-xs max-w-xs mx-auto">Enter an origin and destination above to search, or explore our popular routes below.</p>
                </motion.div>

                {/* Popular Routes Grid */}
                <section>
                  <h3 className="font-heading font-black uppercase tracking-[0.2em] text-sm mb-4 flex items-center gap-2">
                    <Plane size={14} className="text-accent" /> Popular Routes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { from: 'New Delhi', fromCode: 'DEL', to: 'Mumbai', toCode: 'BOM', price: '4,500' },
                      { from: 'Bangalore', fromCode: 'BLR', to: 'Delhi', toCode: 'DEL', price: '6,200' },
                      { from: 'Mumbai', fromCode: 'BOM', to: 'Goa', toCode: 'GOI', price: '2,500' },
                      { from: 'Hyderabad', fromCode: 'HYD', to: 'Bangalore', toCode: 'BLR', price: '3,200' },
                    ].map((route) => (
                      <motion.div
                        key={`${route.fromCode}-${route.toCode}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-5 group hover:border-accent/40 cursor-pointer transition-all relative overflow-hidden"
                        onClick={() => {
                          dispatch(setFilters({ origin: route.fromCode, destination: route.toCode }));
                        }}
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-15 transition-opacity">
                          <Plane size={52} className="rotate-45" />
                        </div>
                        <div className="flex justify-between items-center relative z-10">
                          <div>
                            <p className="text-[10px] font-black text-accent uppercase tracking-widest">{route.fromCode} → {route.toCode}</p>
                            <h4 className="font-heading font-bold text-base mt-0.5">{route.from} → {route.to}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-textMuted">From</p>
                            <p className="text-xl font-mono font-black text-secondary">₹{route.price}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Popular Routes Images */}
                <section>
                  <h3 className="text-xl font-heading font-black mb-4">Popular Destinations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80', city: 'Mumbai', code: 'BOM' },
                      { img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80', city: 'Delhi', code: 'DEL' },
                      { img: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=400&q=80', city: 'Kolkata', code: 'CCU' },
                      { img: 'https://images.unsplash.com/photo-1506461883276-594c8cb25638?auto=format&fit=crop&w=400&q=80', city: 'Chennai', code: 'MAA' },
                      { img: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80', city: 'Hyderabad', code: 'HYD' },
                      { img: 'https://images.unsplash.com/photo-1548013146-72479768bcea?auto=format&fit=crop&w=400&q=80', city: 'Bangalore', code: 'BLR' },
                    ].map((dest) => (
                      <motion.div
                        key={dest.code}
                        whileHover={{ scale: 1.03 }}
                        className="relative h-32 rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => dispatch(setFilters({ origin: dest.code }))}
                      >
                        <img src={dest.img} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <h4 className="font-heading font-black text-white text-sm">{dest.city}</h4>
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{dest.code}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </AnimatePresence>

          {/* Enterprise Platform Section */}
          {sortedResults.length === 0 && !isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 glass-card p-8 bg-white/3 border-white/8"
            >
              <h2 className="text-2xl font-heading font-black mb-3">
                <span className="text-accent">TravelDesk:</span> Enterprise Flight Intelligence
              </h2>
              <p className="text-textMuted text-sm leading-relaxed max-w-3xl mb-8">
                Built for high-performance aviation environments, TravelDesk connects to global airline inventories delivering sub-second fare aggregations, instant PNR generation, and real-time disruption management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { icon: Zap, title: 'AI-Driven Fare Prediction', desc: 'Predictive modeling across millions of routes surfaces micro-fluctuations before they hit GDS systems — giving you the edge to buy at the right moment.' },
                  { icon: Clock, title: 'Zero-Latency Multi-Modal', desc: 'Aviation, ground transit, and railway logistics unified into one booking pipeline. WebSocket-backed live status tracking for mission-critical operations.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-white mb-1">{title}</h3>
                      <p className="text-textMuted text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </main>
      </div>

      <SeatMapModal isOpen={isSeatModalOpen} onClose={() => setIsSeatModalOpen(false)} />
    </div>
  );
};

export default Flights;
