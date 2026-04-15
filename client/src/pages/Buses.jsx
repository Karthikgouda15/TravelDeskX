// /Users/karthikgouda/Desktop/TravelDesk/client/src/pages/Buses.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Search, Calendar, MapPin, Navigation, 
  Filter, ArrowRightLeft, Shield, Coffee, Battery, Wifi 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { searchBuses, setBusFilters, setSelectedBus } from '../features/busSlice';
import { setCheckoutData } from '../features/bookingSlice';
import useBusSocket from '../hooks/useBusSocket';
import CityAutocomplete from '../components/CityAutocomplete';
import BusCard from '../components/BusCard';
import SeatSelectionModal from '../components/SeatSelectionModal';

const Buses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { results, isLoading, filters, error, selectedBus } = useSelector((state) => state.buses);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  // Real-time socket integration
  useBusSocket(results);

  useEffect(() => {
    // Initial fetch for popular routes or generic view if filters exist
    if (filters.origin && filters.destination) {
      setSearchInitiated(true);
      dispatch(searchBuses(filters));
    }
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!filters.origin || !filters.destination || !filters.date) return;
    setSearchInitiated(true);
    dispatch(searchBuses(filters));
  };

  const onSelectBus = (bus) => {
    dispatch(setSelectedBus(bus));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    dispatch(setSelectedBus(null));
  };

  const onConfirmBooking = (passengerDetails) => {
    const busToBook = results.find(b => b._id === selectedBus?._id) || selectedBus;
    
    dispatch(setCheckoutData({
      type: 'bus',
      bus: busToBook,
      item: busToBook,
      selectedSeats: passengerDetails.map(p => p.seatNumber),
      passengerDetails, // Custom field for bus
      totalPrice: (busToBook?.price + 45) * passengerDetails.length
    }));
    
    handleCloseModal();
    navigate('/checkout');
  };

  const swapCities = () => {
    dispatch(setBusFilters({ 
      origin: filters.destination, 
      destination: filters.origin 
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Helmet>
        <title>Bus Booking | Premium TravelDesk</title>
      </Helmet>

      {/* Hero Search Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/[0.03] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/[0.02] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6">
              <Shield size={14} className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1A1]">Premium Bus Core Active</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-[#555555] bg-clip-text text-transparent italic">
              TRAVEL BY ROAD
            </h1>
            <p className="text-lg font-medium text-[#A1A1A1] max-w-2xl mx-auto">
              Experience the pinnacle of luxury bus travel. Real-time availability, interactive seat maps, and sanitized premium coaches.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A0A0A] border border-white/10 p-2 rounded-[40px] shadow-2xl relative"
          >
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-2">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <CityAutocomplete
                  label="From City"
                  placeholder="Starting point"
                  value={filters.origin}
                  onChange={(val) => dispatch(setBusFilters({ origin: val }))}
                  icon={Navigation}
                />
                <div className="relative group">
                   <CityAutocomplete
                    label="To City"
                    placeholder="Where to?"
                    value={filters.destination}
                    onChange={(val) => dispatch(setBusFilters({ destination: val }))}
                    icon={MapPin}
                  />
                  <button 
                    type="button"
                    onClick={swapCities}
                    className="absolute -left-6 top-[55%] -translate-y-1/2 w-10 h-10 bg-[#111111] border border-white/10 rounded-full flex items-center justify-center text-[#555555] hover:text-white hover:border-white/30 transition-all z-10"
                  >
                    <ArrowRightLeft size={16} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-2 px-1">Departure Date</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1A1] group-focus-within:text-white">
                      <Calendar size={18} />
                    </div>
                    <input 
                      type="date"
                      value={filters.date}
                      onChange={(e) => dispatch(setBusFilters({ date: e.target.value }))}
                      className="w-full bg-[#111111]/80 backdrop-blur-xl border border-[#1A1A1A] hover:border-[#333333] focus:border-white/20 rounded-xl py-4 pl-12 pr-4 text-white outline-none transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full lg:w-48 h-[74px] lg:h-full bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-black/10 border-t-black rounded-full animate-spin" /> : <Search size={20} />}
                Search
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-7xl mx-auto px-6">
        {!searchInitiated ? (
          <div className="py-20">
            <h2 className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-12 text-center">Popular Luxury Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { from: 'Delhi', to: 'Manali', price: 2400, desc: 'Luxury AC Sleeper' },
                { from: 'Mumbai', to: 'Goa', price: 1850, desc: 'Volvo B11R Premium' },
                { from: 'Bangalore', to: 'Hyderabad', price: 1250, desc: 'Scania Multi-Axle' }
              ].map((route, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  onClick={() => {
                    dispatch(setBusFilters({ origin: route.from, destination: route.to }));
                    dispatch(searchBuses({ ...filters, origin: route.from, destination: route.to }));
                    setSearchInitiated(true);
                  }}
                  className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[40px] cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#555555] group-hover:bg-white group-hover:text-black transition-all duration-500">
                      <Navigation size={20} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-1">Starts From</div>
                      <div className="text-2xl font-black text-white italic">₹{route.price}</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{route.from} to {route.to}</h3>
                  <p className="text-xs font-bold text-[#555555] uppercase tracking-widest">{route.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter">
                  {results.length} BUSES FOUND
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black text-[#555555] uppercase tracking-widest italic">{filters.origin}</span>
                  <ArrowRightLeft size={10} className="text-[#333333]" />
                  <span className="text-[10px] font-black text-[#555555] uppercase tracking-widest italic">{filters.destination}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#555555] hover:text-white transition-colors">
                  <Filter size={14} />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid gap-8">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 bg-[#0A0A0A] rounded-[32px] border border-white/5 animate-pulse" />
                ))
              ) : results.length > 0 ? (
                results.map((bus) => (
                  <BusCard key={bus._id} bus={bus} onSelect={onSelectBus} />
                ))
              ) : (
                <div className="text-center py-40">
                  <Bus size={48} className="mx-auto text-[#111111] mb-6" />
                  <h3 className="text-xl font-bold text-white">No luxury buses found</h3>
                  <p className="text-sm font-medium text-[#555555] mt-2">Try adjusting your date or search for different cities.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <SeatSelectionModal 
            bus={selectedBus} 
            isOpen={isModalOpen} 
            onClose={handleCloseModal}
            onConfirm={onConfirmBooking}
          />
        )}
      </AnimatePresence>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
           {[
             { icon: Shield, title: 'Safe-Travel+', desc: 'Sanitized coaches & vaccinated staff' },
             { icon: Wifi, title: 'High-Speed WiFi', desc: 'Connectivity on all premium routes' },
             { icon: Coffee, title: 'Snacks & Drinks', desc: 'Complementary refreshments served' },
             { icon: Battery, title: 'Charging Points', desc: 'Every seat with individual power' }
           ].map((item, i) => (
             <div key={i} className="space-y-4">
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                 <item.icon size={20} />
               </div>
               <h4 className="text-sm font-black uppercase tracking-widest text-white">{item.title}</h4>
               <p className="text-xs font-medium text-[#555555] leading-relaxed">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default Buses;
