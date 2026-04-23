// /Users/karthikgouda/Desktop/TravelDesk/client/src/pages/Trains.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Train, 
  ArrowRightLeft, 
  Info, 
  Navigation, 
  Activity,
  ArrowRight,
  TrendingUp,
  Filter,
  Shield,
  X,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Components
import StationAutocomplete from '../components/StationAutocomplete';
import TrainCard from '../components/TrainCard';
import TrainToolsModal from '../components/TrainToolsModal';
import { 
  searchTrains, 
  getPopularTrainRoutes, 
  getPNRStatus, 
  getLiveTrainStatus,
  setTrainFilters,
  clearTrainTools,
  setSelectedTrain
} from '../features/trainSlice';
import useTrainSocket from '../hooks/useTrainSocket';
import { setCheckoutData } from '../features/bookingSlice';

const Trains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    results, 
    popularRoutes, 
    isLoading, 
    isPopularLoading, 
    isToolLoading,
    pnrStatus, 
    liveStatus,
    filters,
    error 
  } = useSelector((state) => state.trains);

  // Hook for real-time seat updates
  useTrainSocket(results);

  // Local state
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [toolType, setToolType] = useState('pnr');
  const [pnrInput, setPnrInput] = useState('');
  const [trainNoInput, setTrainNoInput] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);

  useEffect(() => {
    console.log('🚂 Trains page mounted, fetching popular routes...');
    dispatch(getPopularTrainRoutes());
  }, [dispatch]);

  useEffect(() => {
    console.log('🚂 Trains results updated:', results);
  }, [results]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!filters.origin || !filters.destination || !filters.date) return;
    setSearchInitiated(true);
    dispatch(searchTrains(filters));
  };

  const swapStations = () => {
    dispatch(setTrainFilters({
      origin: filters.destination,
      destination: filters.origin
    }));
  };

  const handleToolAction = (type) => {
    setToolType(type);
    setShowToolsModal(true);
    if (type === 'pnr' && pnrInput.length === 10) {
      dispatch(getPNRStatus(pnrInput));
    } else if (type === 'status' && trainNoInput) {
      dispatch(getLiveTrainStatus(trainNoInput));
    }
  };

  const onBook = (train, cls) => {
    dispatch(setSelectedTrain({ ...train, selectedClass: cls }));
    dispatch(setCheckoutData({
      type: 'train',
      item: train,
      selectedClass: cls,
      passengers: filters.passengers || 1 
    }));
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <Activity size={14} className="text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Real-time Train Intelligence</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8"
          >
            Better <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Train Booking</span><br/>
            Engineered.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#A1A1A1] font-medium max-w-2xl mx-auto mb-16"
          >
            Powered by IRCTC real-time data API. Get instant availability, 
            PNR predictions, and live running status.
          </motion.p>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-[#111111]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[40px] shadow-2xl">
              <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-6">
                <div className="flex-[2] flex flex-col md:flex-row gap-6 relative">
                  <StationAutocomplete
                    label="From"
                    placeholder="Source Station"
                    value={filters.origin}
                    onChange={(val) => dispatch(setTrainFilters({ origin: val }))}
                  />
                  
                  <button
                    type="button"
                    onClick={swapStations}
                    className="absolute left-1/2 top-11 -translate-x-1/2 z-10 p-2 rounded-full bg-[#1A1A1A] border border-white/10 text-white hover:bg-white hover:text-black transition-all shadow-xl md:rotate-0 rotate-90"
                  >
                    <ArrowRightLeft size={16} />
                  </button>

                  <StationAutocomplete
                    label="To"
                    placeholder="Destination Station"
                    value={filters.destination}
                    onChange={(val) => dispatch(setTrainFilters({ destination: val }))}
                  />
                </div>

                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-2 px-1">Departure Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1A1] group-focus-within:text-white" size={18} />
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => dispatch(setTrainFilters({ date: e.target.value }))}
                      className="w-full bg-[#111111]/80 backdrop-blur-xl border border-[#1A1A1A] rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all font-medium h-[54px]"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full lg:w-auto px-10 h-[54px] bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search size={18} />
                        Search Trains
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6">
        {!searchInitiated ? (
          <div className="space-y-24">
            {/* Quick Tools Section */}
            <section>
              <div className="flex items-center gap-3 mb-10">
                <Navigation size={20} className="text-blue-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Travel Intelligence Tools</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* PNR Tool Card */}
                <div className="p-8 rounded-[32px] bg-[#111111]/40 border border-white/5 hover:border-white/10 transition-all group">
                  <h3 className="text-lg font-bold text-white mb-4">Check PNR Status</h3>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="Enter 10-digit PNR"
                      value={pnrInput}
                      onChange={(e) => setPnrInput(e.target.value)}
                      className="w-full bg-black/40 border border-[#1A1A1A] rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                    />
                    <button
                      onClick={() => handleToolAction('pnr')}
                      className="absolute right-2 top-1.2 p-2 text-[#A1A1A1] hover:text-white"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] font-medium text-[#555555] uppercase tracking-wider">
                    Powered by PNR Prediction Engine
                  </p>
                </div>

                {/* Running Status Tool Card */}
                <div className="p-8 rounded-[32px] bg-[#111111]/40 border border-white/5 hover:border-white/10 transition-all group">
                  <h3 className="text-lg font-bold text-white mb-4">Live Train Status</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Train Name/Number"
                      value={trainNoInput}
                      onChange={(e) => setTrainNoInput(e.target.value)}
                      className="w-full bg-black/40 border border-[#1A1A1A] rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-white/20 transition-all"
                    />
                    <button
                      onClick={() => handleToolAction('status')}
                      className="absolute right-2 top-1.2 p-2 text-[#A1A1A1] hover:text-white"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                  <p className="mt-4 text-[11px] font-medium text-[#555555] uppercase tracking-wider">
                    Real-time GPS Tracking
                  </p>
                </div>

                {/* Free Cancellation Info Card */}
                <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield size={24} className="text-blue-400" />
                    <h3 className="text-lg font-black text-white">TravelDesk Assured</h3>
                  </div>
                  <p className="text-sm text-[#A1A1A1] font-medium leading-relaxed mb-4">
                    Get full refund on cancellations with zero documentation. Opt-in at checkout.
                  </p>
                  <button className="text-[11px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300">
                    Learn More
                  </button>
                </div>
              </div>
            </section>

            {/* Popular Routes Section */}
            <section>
              <div className="flex items-center gap-3 mb-10">
                <TrendingUp size={20} className="text-purple-500" />
                <h2 className="text-2xl font-black text-white tracking-tight">Popular Train Journeys</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isPopularLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-[4/5] rounded-[32px] bg-[#111111] animate-pulse" />
                  ))
                ) : (
                  popularRoutes?.map((route, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className="group relative aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer"
                      onClick={() => {
                        dispatch(setTrainFilters({ origin: route.fromCode, destination: route.toCode }));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <img src={route.image} alt={route.from} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">{route.from} → {route.to}</p>
                        <h4 className="text-xl font-bold text-white mb-2">From ₹{route.price}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                          Search Now <ArrowRight size={12} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          /* Results Section */
          <div className="pb-20">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* Sidebar Filters */}
              <aside className="lg:w-72 shrink-0">
                <div className="sticky top-24 space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#A1A1A1]">Filters</h3>
                    <button 
                      onClick={() => dispatch(setTrainFilters({ coachClass: 'All', trainType: 'All' }))}
                      className="text-[10px] font-bold text-blue-500 hover:text-blue-400"
                    >
                      Reset All
                    </button>
                  </div>
                  
                  <div className="p-6 rounded-3xl bg-[#111111]/40 border border-white/5 space-y-8">
                    {/* Class Filter */}
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Coach Class</p>
                      <div className="space-y-2">
                        {['All', '1A', '2A', '3A', 'SL', 'CC'].map(cls => (
                          <label key={cls} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="radio"
                              name="coachClass"
                              checked={filters.coachClass === cls}
                              onChange={() => dispatch(setTrainFilters({ coachClass: cls }))}
                              className="w-4 h-4 bg-black border-[#333333] rounded-full checked:bg-blue-500 checked:border-transparent transition-all"
                            />
                            <span className={`text-[13px] font-medium transition-colors ${
                              filters.coachClass === cls ? 'text-white' : 'text-[#A1A1A1] group-hover:text-white'
                            }`}>
                              {cls === 'All' ? 'All Classes' : cls}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Quick Sort */}
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-4">Sort By</p>
                      <select 
                        className="w-full bg-black border border-[#333333] rounded-lg p-2 text-xs font-bold text-white outline-none"
                        value={filters.sortBy}
                        onChange={(e) => dispatch(setTrainFilters({ sortBy: e.target.value }))}
                      >
                        <option value="departure-asc">Earliest Departure</option>
                        <option value="departure-desc">Latest Departure</option>
                        <option value="duration-asc">Fastest First</option>
                        <option value="price-asc">Cheapest First</option>
                      </select>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Result Cards */}
              <main className="flex-1 space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-sm font-medium text-[#A1A1A1]">
                    Showing <span className="text-white font-bold">{results.length} trains</span> for your route
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Updates On</span>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-80 rounded-[40px] bg-[#111111] animate-pulse" />
                  ))
                ) : results?.length > 0 ? (
                  <div className="space-y-8">
                    {results?.map((train) => (
                      <TrainCard 
                        key={train._id} 
                        train={train} 
                        onBook={onBook}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-[#A1A1A1]">
                      <Train size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">No Trains Found</h3>
                    <p className="text-[#A1A1A1] font-medium">Try searching for a different date or another route.</p>
                  </div>
                )}
              </main>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding Area */}
      {!searchInitiated && (
        <section className="mt-32 pt-32 border-t border-white/5 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <span className="font-black text-black">TD</span>
              </div>
              <h3 className="text-2xl font-black text-white">The Future of Rail Travel.</h3>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                TravelDesk provides a unified interface for Indian Railways booking, powered by next-gen algorithms for availability prediction.
              </p>
            </div>
            <div className="grid grid-cols-2 col-span-2 gap-12">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6">Experience</h4>
                <ul className="space-y-3 text-sm text-[#A1A1A1] font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Instant PNR</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Route Maps</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Station Feeds</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Smart Booking</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6">Assistance</h4>
                <ul className="space-y-3 text-sm text-[#A1A1A1] font-medium">
                  <li className="hover:text-white cursor-pointer transition-colors">Help Center</li>
                  <li className="hover:text-white cursor-pointer transition-colors">IRCTC Guide</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Refund Status</li>
                  <li className="hover:text-white cursor-pointer transition-colors">Travel Alerts</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tools Modal (PNR/Live Status) */}
      <TrainToolsModal
        isOpen={showToolsModal}
        onClose={() => {
          setShowToolsModal(false);
          dispatch(clearTrainTools());
        }}
        type={toolType}
        isLoading={isToolLoading}
        data={toolType === 'pnr' ? pnrStatus : liveStatus}
      />
    </div>
  );
};

export default Trains;
