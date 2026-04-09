// /Users/karthikgouda/Desktop/TravelDesk/client/src/pages/Trains.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getTrains, setFilters, setSelectedTrain } from '../features/trainSlice';
import { setCheckoutData } from '../features/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, Clock, MapPin, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import UniversalSearch from '../components/UniversalSearch';
import SkeletonCard from '../components/SkeletonCard';

const Trains = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { results, isLoading, filters } = useSelector((state) => state.trains);

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
      dispatch(getTrains(filters));
    }
  }, [dispatch, filters.origin, filters.destination, filters.date]);

  const handleBook = (train, coachClass) => {
    dispatch(setSelectedTrain(train));
    dispatch(setCheckoutData({
      type: 'train',
      item: train,
      classType: coachClass.type,
      totalPrice: coachClass.price
    }));
    navigate('/checkout');
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Train Search | TravelDesk</title>
      </Helmet>

      <div className="mb-12">
        <UniversalSearch />
      </div>

      <main className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-heading font-black uppercase tracking-widest text-white">
            {isLoading ? 'Searching Rail Inventory...' : `${results.length} Trains Found`}
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <ShieldCheck size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase text-blue-400">IRCTC Authorized Agent</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <SkeletonCard count={3} />
          ) : results.length > 0 ? (
            results.map((train, idx) => (
              <motion.div
                key={train._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card overflow-hidden group hover:border-blue-500/30 transition-all border-white/5"
              >
                <div className="flex flex-col lg:flex-row gap-8 p-6">
                  {/* Train Info */}
                  <div className="lg:w-1/4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Train size={20} />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-white">{train.name}</h3>
                        <p className="text-[10px] font-black uppercase text-textMuted tracking-widest">#{train.trainNumber} | {train.operator}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dIdx) => (
                            <span key={dIdx} className={`text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-md border ${train.runsOn.includes(['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dIdx]) ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'border-white/5 text-textMuted'}`}>
                                {day}
                            </span>
                        ))}
                    </div>
                  </div>

                  {/* Route Info */}
                  <div className="lg:w-2/4 flex items-center justify-between px-8 border-x border-white/5">
                    <div className="text-center">
                        <p className="text-2xl font-mono font-black text-white">{train.route[0].departureTime}</p>
                        <p className="text-[12px] font-bold text-textMuted">{train.route[0].stationName}</p>
                        <p className="text-[10px] font-black uppercase text-accent">{train.route[0].stationCode}</p>
                    </div>
                    <div className="flex-1 px-8 flex flex-col items-center gap-2">
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent relative">
                            <ArrowRight size={14} className="absolute left-1/2 -translate-x-1/2 -top-1.5 text-blue-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-textMuted tracking-tighter flex items-center gap-1">
                            <Clock size={10} /> 12h 30m
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-mono font-black text-white">{train.route[train.route.length - 1].arrivalTime}</p>
                        <p className="text-[12px] font-bold text-textMuted">{train.route[train.route.length - 1].stationName}</p>
                        <p className="text-[10px] font-black uppercase text-accent">{train.route[train.route.length - 1].stationCode}</p>
                    </div>
                  </div>

                  {/* Classes & Booking */}
                  <div className="lg:w-1/4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {train.classes.map((cls) => (
                        <button
                          key={cls.type}
                          onClick={() => handleBook(train, cls)}
                          className="p-3 bg-white/[0.03] border border-white/10 rounded-xl hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-white uppercase">{cls.type}</span>
                            <span className="text-xs font-mono font-black text-blue-400">₹{cls.price}</span>
                          </div>
                          <p className={`text-[9px] font-black uppercase tracking-tighter ${cls.availableSeats > 20 ? 'text-green-400' : 'text-orange-400'}`}>
                            {cls.availableSeats} available
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass-card text-center py-20 border-dashed border-white/10">
              <Search size={48} className="mx-auto text-textMuted mb-4 opacity-20" />
              <h3 className="text-xl font-heading font-black text-white mb-2">No Trains Found</h3>
              <p className="text-textMuted text-sm max-w-sm mx-auto">Try searching for popular routes like BCT to NDLS or check nearby dates.</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Trains;
