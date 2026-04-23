// src/pages/MyBookings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyBookings, cancelBooking } from '../features/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Plane, Hotel, Calendar, CreditCard, ChevronRight, XCircle, MoreVertical, Briefcase, Train, Bus } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import SkeletonCard from '../components/SkeletonCard';

const MyBookings = () => {
  const dispatch = useDispatch();
  const { myBookings, isLoading } = useSelector((state) => state.auth.user ? state.bookings : { myBookings: [], isLoading: false });
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    dispatch(getMyBookings());
  }, [dispatch]);

  const filteredBookings = activeTab === 'all' 
    ? myBookings 
    : myBookings.filter(b => b.type === activeTab);

  const handleCancel = (id) => {
     if (window.confirm('Are you sure you want to cancel this booking? This action is permanent.')) {
        dispatch(cancelBooking(id));
     }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Helmet>
        <title>My Bookings | TravelDesk</title>
      </Helmet>

      <div className="mb-12">
         <h2 className="text-4xl font-heading font-black tracking-tighter mb-2 uppercase">My Bookings</h2>
         <p className="text-textMuted font-bold uppercase tracking-widest text-xs">Review your upcoming and past adventure details.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-8">
         {['all', 'flight', 'hotel', 'train', 'bus'].map(tab => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border
                  ${activeTab === tab ? 'bg-accent border-accent text-background shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted hover:border-white/20 hover:text-white'}
               `}
            >
               {tab === 'all' ? 'All' : tab === 'bus' ? 'Buses' : tab + 's'}
            </button>
         ))}
      </div>

      <AnimatePresence mode="popLayout">
         {isLoading ? (
            <SkeletonCard count={3} />
         ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
               {filteredBookings.map((booking, index) => (
                  <motion.div
                     key={booking._id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.1 }}
                     className="glass-card group relative hover:border-white/20 transition-all"
                  >
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors
                              ${booking.type === 'flight' ? 'bg-accent/10 border-accent/20 text-accent' : 
                                booking.type === 'train' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                booking.type === 'bus' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                'bg-purple-500/10 border-purple-500/20 text-purple-500'}
                           `}>
                              {booking.type === 'flight' && <Plane size={24} />}
                              {booking.type === 'hotel' && <Hotel size={24} />}
                              {booking.type === 'train' && <Train size={24} />}
                              {booking.type === 'bus' && <Bus size={24} />}
                           </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                 <h4 className="font-heading font-black text-lg">
                                    {booking.type === 'flight' && (booking.referenceId ? `${booking.referenceId.originCity || booking.referenceId.origin || ''} → ${booking.referenceId.destinationCity || booking.referenceId.destination || ''}` : 'Flight Trip')}
                                    {booking.type === 'hotel' && (booking.referenceId?.name || 'Hotel Stay')}
                                    {booking.type === 'train' && (booking.referenceId?.name || 'Train Journey')}
                                    {booking.type === 'bus' && (
                                      booking.referenceId?.origin?.city 
                                      ? `${booking.referenceId?.origin?.city} → ${booking.referenceId?.destination?.city || 'Unknown'}`
                                      : 'Bus Journey'
                                    )}
                                 </h4>
                                 <StatusBadge status={booking.status} />
                              </div>
                              <div className="flex items-center gap-4 text-xs font-mono text-textMuted">
                                 <div className="flex items-center gap-1.5"><Calendar size={12} className="text-secondary" /> {new Date(booking.createdAt).toLocaleDateString()}</div>
                                 <div className="flex items-center gap-1.5">
                                   <Briefcase size={12} className="text-accent" /> 
                                   {booking.type === 'bus' ? `${booking.passengers?.length || 0} Passengers` : 
                                    booking.type === 'flight' ? `${booking.seats?.length || 0} Seats` :
                                    booking.type === 'hotel' ? '1 Room' : '1 Booking'}
                                 </div>
                                 <div className="flex items-center gap-1.5 font-black text-white">₹ {booking.totalPrice}</div>
                              </div>
                              
                              {/* Passenger Small Badge Summary for Bus */}
                              {booking.type === 'bus' && booking.passengers?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {booking.passengers.map((p, idx) => (
                                    <div key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-textMuted">
                                      {p.seatNumber}: {p.name}
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                           {booking.status !== 'cancelled' && (
                              <button
                                 onClick={() => handleCancel(booking._id)}
                                 className="flex-1 md:flex-none p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-textMuted hover:text-red-500 transition-all flex items-center justify-center gap-2 group-btn"
                              >
                                 <span className="text-[10px] uppercase font-black tracking-widest hidden group-btn-hover:block">Cancel Trip</span>
                                 <XCircle size={18} />
                              </button>
                           )}
                           <button className="flex-1 md:flex-none p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 text-accent hover:bg-accent/5 transition-all flex items-center justify-center gap-2">
                              <span className="text-[10px] uppercase font-black tracking-widest">Details</span>
                              <ChevronRight size={18} />
                           </button>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         ) : (
            <div className="py-24 text-center glass-card border-dashed">
               <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-textMuted">
                  <CreditCard size={32} />
               </div>
               <h3 className="text-xl font-heading font-bold mb-2">No {activeTab === 'all' ? 'Bookings' : activeTab + 's'} Found</h3>
               <p className="text-textMuted max-w-sm mx-auto uppercase tracking-widest text-[10px] font-black">
                  Adventure is calling. {activeTab === 'all' ? 'Start your first journey today!' : `Find your next dream ${activeTab}.`}
               </p>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookings;
