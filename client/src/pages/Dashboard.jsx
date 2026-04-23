// src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, ArrowUpRight, Plane, Hotel, Train, Bus, Loader2 } from 'lucide-react';
import UniversalSearch from '../components/UniversalSearch';
import { getMyBookings } from '../features/bookingSlice';
import heroImage from '../assets/hero_apple.png';

const TiltCard = ({ children, className, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { damping: 50 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { damping: 50 });
  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - (rect.left + rect.width / 2));
    y.set(event.clientY - (rect.top + rect.height / 2));
  }
  return (
    <motion.div onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY }} onClick={onClick}
      className={`${className} perspective-1000 cursor-pointer`}>
      <div className="h-full w-full glass-card relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
};

const TYPE_ICONS = { flight: Plane, hotel: Hotel, train: Train, bus: Bus };

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { myBookings, isLoading } = useSelector((state) => state.bookings);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => { dispatch(getMyBookings({ limit: 5 })); }, [dispatch]);

  const formatBookingTitle = (b) => {
    if (b.type === 'flight' && b.referenceId) return `${b.referenceId.originCity || b.referenceId.origin} → ${b.referenceId.destinationCity || b.referenceId.destination}`;
    if (b.type === 'hotel' && b.referenceId) return b.referenceId.name || 'Hotel Booking';
    if (b.type === 'train' && b.referenceId) return b.referenceId.name || 'Train Booking';
    if (b.type === 'bus' && b.referenceId) return b.referenceId.operatorName || 'Bus Booking';
    return 'Booking';
  };
  const formatBookingSub = (b) => {
    const typeLabel = b.type.toUpperCase();
    const status = (b.status || 'pending').toUpperCase();
    if (b.type === 'flight' && b.referenceId) return `${typeLabel} ${b.referenceId.flightNumber || ''} • ${status}`;
    return `${typeLabel} • ${status}`;
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } } };

  const totalTrips = myBookings?.length || 0;
  const totalSpend = myBookings?.reduce((s, b) => s + (b.totalPrice || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <main className="pt-32 pb-48">
        <div className="max-w-6xl mx-auto px-10 text-center space-y-40">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }} className="space-y-8">
            <h1 className="text-7xl font-sans font-bold tracking-tightest leading-[0.95] silver-text">
              The future of <br />business travel.
            </h1>
            <p className="apple-subheadline max-w-lg mx-auto text-lg text-white/40 font-light">
              Welcome back, <span className="text-white font-medium">{user?.name}</span>. <br />
              {totalTrips > 0 ? `${totalTrips} trips booked • ₹${totalSpend.toLocaleString('en-IN')} invested` : 'Your executive logistics engine is ready.'}
            </p>
          </motion.div>

          {/* Hero Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }} className="relative">
            <div className="absolute inset-0 bg-white/[0.01] blur-[100px] rounded-full scale-75 -z-10" />
            <img src={heroImage} alt="Futuristic Travel Desk" className="w-full max-w-5xl mx-auto rounded-[2rem] shadow-2xl" />
            <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-4/5 h-12 bg-black blur-3xl opacity-80" />
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-4xl mx-auto">
            <UniversalSearch />
          </motion.div>

          {/* Feature Tiles */}
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible"
            viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <TiltCard onClick={() => navigate('/flights')}>
              <div className="p-16 text-left space-y-8">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-sans font-bold tracking-tight text-white leading-tight">Book <br /> Flights</h3>
                  <ArrowUpRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={32} />
                </div>
                <p className="text-white/40 text-lg font-light leading-relaxed">Exclusive enterprise rates for international travel through our GDS network.</p>
                <div className="pt-6"><span className="text-link-apple text-lg">TravelDesk GDS Express</span></div>
              </div>
            </TiltCard>
            <TiltCard onClick={() => navigate('/hotels')}>
              <div className="p-16 text-left space-y-8">
                <div className="flex justify-between items-start">
                  <h3 className="text-4xl font-sans font-bold tracking-tight text-white leading-tight">Stay <br /> Luxury</h3>
                  <ArrowUpRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={32} />
                </div>
                <p className="text-white/40 text-lg font-light leading-relaxed">Hand-picked premium resorts and business hotels with sub-second availability.</p>
                <div className="pt-6"><span className="text-link-apple text-lg">Concierge Level v8.4</span></div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Activity Console — LIVE DATA */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-left pt-20 space-y-14">
            <div className="flex justify-between items-end border-b border-white/[0.05] pb-8">
              <div className="space-y-1">
                <h3 className="text-3xl font-sans font-bold tracking-tight">Activity Console</h3>
                <p className="text-sm text-white/30 font-medium uppercase tracking-[0.2em]">Operational Status: Stable</p>
              </div>
              <span className="text-link-apple text-sm cursor-pointer opacity-40 hover:opacity-100" onClick={() => navigate('/my-bookings')}>Access Archives</span>
            </div>
            <motion.div variants={containerVariants} className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-white/30" size={32} /></div>
              ) : myBookings && myBookings.length > 0 ? (
                myBookings.slice(0, 5).map((b, i) => {
                  const Icon = TYPE_ICONS[b.type] || Plane;
                  return (
                    <motion.div key={b._id || i} variants={itemVariants}
                      className="flex items-center justify-between py-10 px-4 group hover:bg-white/[0.01] transition-all cursor-pointer rounded-2xl">
                      <div className="flex items-center gap-8">
                        <Icon size={18} className="text-white/20" />
                        <div className="space-y-1">
                          <p className="text-xl font-sans font-medium">{formatBookingTitle(b)}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{formatBookingSub(b)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <p className="text-xl font-mono text-white/80">₹{(b.totalPrice || 0).toLocaleString('en-IN')}</p>
                        <ChevronRight size={20} className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <p className="text-white/20 text-lg">No bookings yet. Start exploring!</p>
                  <button onClick={() => navigate('/flights')} className="mt-6 text-link-apple text-sm">Search Flights →</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
