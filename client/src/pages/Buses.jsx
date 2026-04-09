// /Users/karthikgouda/Desktop/TravelDesk/client/src/pages/Buses.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getBuses, setFilters, setSelectedBus } from '../features/busSlice';
import { setCheckoutData } from '../features/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, Clock, MapPin, Search, Star, Wifi, Battery, Coffee, Shield, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import UniversalSearch from '../components/UniversalSearch';
import SkeletonCard from '../components/SkeletonCard';

const amenityIcons = {
  'WiFi': Wifi,
  'Charging Point': Battery,
  'Water Bottle': Coffee,
  'CCTV': Shield,
};

const Buses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { results, isLoading, filters } = useSelector((state) => state.buses);

  useEffect(() => {
    const pOrigin = searchParams.get('origin');
    const pDestination = searchParams.get('destination');
    const pDate = searchParams.get('date');

    if (pOrigin || pDestination || pDate) {
      dispatch(setFilters({
        origin: pOrigin || '',
        destination: pDestination || '',
        date: pDate || ''
      }));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (filters.origin && filters.destination) {
      dispatch(getBuses(filters));
    }
  }, [dispatch, filters.origin, filters.destination, filters.date]);

  const handleBook = (bus) => {
    dispatch(setSelectedBus(bus));
    dispatch(setCheckoutData({
      type: 'bus',
      item: bus,
      totalPrice: bus.price
    }));
    navigate('/checkout');
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Bus Search | TravelDesk</title>
      </Helmet>

      <div className="mb-12">
        <UniversalSearch />
      </div>

      <main className="space-y-6">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-black uppercase tracking-widest text-white">
                {isLoading ? 'Fetching Bus Routes...' : `${results.length} Buses Found`}
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                <Shield size={14} className="text-orange-400" />
                <span className="text-[10px] font-black uppercase text-orange-400">Safe-Travel Certified</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <SkeletonCard count={3} />
          ) : results.length > 0 ? (
            results.map((bus, idx) => (
              <motion.div
                key={bus._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card overflow-hidden group hover:border-orange-500/30 transition-all border-white/5"
              >
                <div className="flex flex-col lg:flex-row gap-8 p-6">
                  {/* Operator Info */}
                  <div className="lg:w-1/4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                        <Bus size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-white">{bus.operatorName}</h3>
                        <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest">{bus.busType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(bus.rating) ? 'text-orange-400 fill-orange-400' : 'text-white/10'} />
                        ))}
                        <span className="text-[10px] font-black text-white ml-2">{bus.rating}</span>
                    </div>
                  </div>

                  {/* Journey Info */}
                  <div className="lg:w-2/4 flex items-center justify-between px-8 border-x border-white/5">
                    <div className="text-center">
                        <p className="text-2xl font-mono font-black text-white">
                            {new Date(bus.origin.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[12px] font-bold text-textMuted">{bus.origin.city}</p>
                        <p className="text-[9px] font-black uppercase text-orange-400">{bus.origin.stationName}</p>
                    </div>
                    <div className="flex-1 px-8 flex flex-col items-center gap-2">
                        <p className="text-[10px] font-black uppercase text-textMuted flex items-center gap-1">
                            <Clock size={10} /> {Math.floor(bus.duration/60)}h {bus.duration%60}m
                        </p>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent relative">
                            <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-mono font-black text-white">
                            {new Date(bus.destination.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[12px] font-bold text-textMuted">{bus.destination.city}</p>
                        <p className="text-[9px] font-black uppercase text-orange-400">{bus.destination.stationName}</p>
                    </div>
                  </div>

                  {/* Pricing & Booking */}
                  <div className="lg:w-1/4 flex flex-col justify-between items-end">
                    <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                            <span className="text-xs font-bold text-textMuted">₹</span>
                            <span className="text-3xl font-mono font-black text-secondary">{bus.price}</span>
                        </div>
                        <p className="text-[9px] font-black uppercase text-textMuted">{bus.availableSeats} Seats left</p>
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                        {bus.amenities.map(amenity => {
                            const Icon = amenityIcons[amenity];
                            return Icon ? <Icon key={amenity} size={14} className="text-textMuted" title={amenity} /> : null;
                        })}
                    </div>

                    <button 
                        onClick={() => handleBook(bus)}
                        className="btn-primary flex items-center gap-2 px-8 group"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">Select Seat</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass-card text-center py-20 border-dashed border-white/10">
              <Bus size={48} className="mx-auto text-textMuted mb-4 opacity-20" />
              <h3 className="text-xl font-heading font-black text-white mb-2">No Buses Found</h3>
              <p className="text-textMuted text-sm max-w-sm mx-auto">Try searching for different cities or adjust your departure date.</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Buses;
