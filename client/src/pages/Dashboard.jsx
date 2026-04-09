// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import UniversalSearch from '../components/UniversalSearch';
import heroImage from '../assets/hero_apple.png';

const TiltCard = ({ children, className, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { damping: 50 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { damping: 50 });

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function resetMouse() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      style={{ rotateX, rotateY }}
      onClick={onClick}
      className={`${className} perspective-1000 cursor-pointer`}
    >
      <div className="h-full w-full glass-card relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <main className="pt-32 pb-48">
        
        <div className="max-w-6xl mx-auto px-10 text-center space-y-40">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-8"
          >
            <h1 className="text-7xl font-sans font-bold tracking-tightest leading-[0.95] silver-text">
              The future of <br />
              business travel.
            </h1>
            <p className="apple-subheadline max-w-lg mx-auto text-lg text-white/40 font-light">
              Welcome back, <span className="text-white font-medium">{user?.name}</span>. <br />
              Your executive logistics engine is performing at 100% efficiency.
            </p>
          </motion.div>

          {/* Hero Visual Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            {/* Subtle glow plate */}
            <div className="absolute inset-0 bg-white/[0.01] blur-[100px] rounded-full scale-75 -z-10" />
            
            <img 
              src={heroImage} 
              alt="Futuristic Travel Desk" 
              className="w-full max-w-5xl mx-auto rounded-[2rem] shadow-2xl"
            />
            {/* Ambient occlusion shadow */}
            <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-4/5 h-12 bg-black blur-3xl opacity-80" />
          </motion.div>

          {/* Search Stage */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-4xl mx-auto"
          >
            <UniversalSearch />
          </motion.div>

          {/* Interactive Feature Tiles */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            <TiltCard onClick={() => window.location.href = '/flights'}>
               <div className="p-16 text-left space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-4xl font-sans font-bold tracking-tight text-white leading-tight">Book <br /> Flights</h3>
                    <ArrowUpRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={32} />
                  </div>
                  <p className="text-white/40 text-lg font-light leading-relaxed">
                    Exclusive enterprise rates for international travel through our GDS network.
                  </p>
                  <div className="pt-6">
                    <span className="text-link-apple text-lg">TravelDesk GDS Express</span>
                  </div>
               </div>
            </TiltCard>

            <TiltCard onClick={() => window.location.href = '/hotels'}>
               <div className="p-16 text-left space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-4xl font-sans font-bold tracking-tight text-white leading-tight">Stay <br /> Luxury</h3>
                    <ArrowUpRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={32} />
                  </div>
                  <p className="text-white/40 text-lg font-light leading-relaxed">
                    Hand-picked premium resorts and business hotels with sub-second availability.
                  </p>
                  <div className="pt-6">
                    <span className="text-link-apple text-lg">Concierge Level v8.4</span>
                  </div>
               </div>
            </TiltCard>
          </motion.div>

          {/* Pro Activity Console */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-left pt-20 space-y-14"
          >
             <div className="flex justify-between items-end border-b border-white/[0.05] pb-8">
                <div className="space-y-1">
                   <h3 className="text-3xl font-sans font-bold tracking-tight">Activity Console</h3>
                   <p className="text-sm text-white/30 font-medium uppercase tracking-[0.2em]">Operational Status: Stable</p>
                </div>
                <span className="text-link-apple text-sm cursor-pointer opacity-40 hover:opacity-100" onClick={() => window.location.href = '/my-bookings'}>Access Archives</span>
             </div>
             
             <motion.div variants={containerVariants} className="divide-y divide-white/[0.05]">
                {[
                  { title: 'New Delhi → Mumbai', sub: 'FLIGHT AI402 • CONFIRMED', price: '₹12,400', date: 'APR 12' },
                  { title: 'The Imperial New Delhi', sub: 'LUXURY SUITE • 2 NIGHTS', price: '₹48,200', date: 'APR 14' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="flex items-center justify-between py-10 px-4 group hover:bg-white/[0.01] transition-all cursor-pointer rounded-2xl"
                  >
                    <div className="flex items-center gap-12">
                       <span className="text-xs font-mono text-white/20">{item.date}</span>
                       <div className="space-y-1">
                          <p className="text-xl font-sans font-medium">{item.title}</p>
                          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">{item.sub}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <p className="text-xl font-mono text-white/80">{item.price}</p>
                      <ChevronRight size={20} className="text-white/10 group-hover:text-white transition-all transform group-hover:translate-x-2" />
                    </div>
                  </motion.div>
                ))}
             </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
