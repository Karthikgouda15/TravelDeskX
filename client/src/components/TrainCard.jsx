// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/TrainCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Train, Clock, ArrowRight, Info, Coffee, Shield } from 'lucide-react';

const TrainCard = ({ train, onBook }) => {
  const getAvailabilityColor = (seats) => {
    if (seats === 0) return 'text-[#FF4B4B]';
    if (seats < 10) return 'text-[#FFB800]';
    return 'text-[#00C853]';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-[#111111]/60 backdrop-blur-2xl border border-[#1A1A1A] hover:border-white/10 rounded-3xl overflow-hidden transition-all duration-500"
    >
      <div className="p-8">
        {/* Header: Train Info & Badges */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                {train.trainType}
              </span>
              <span className="text-[10px] font-bold text-[#A1A1A1] tracking-widest uppercase">
                #{train.trainNumber}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-white/90 transition-colors">
              {train.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
              const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const isActive = train.runsOn.includes(days[i]);
              return (
                <div 
                  key={i} 
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    isActive ? 'bg-white text-black' : 'bg-[#1A1A1A] text-[#444444]'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline View */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-10 relative">
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-2">Departure</p>
            <h4 className="text-3xl font-black text-white mb-1 tabular-nums tracking-tighter">{train.departureTime}</h4>
            <p className="text-sm font-medium text-white/60">{train.fromStation?.stationName || train.sourceStation?.name} ({train.fromStation?.stationCode || train.sourceStation?.code})</p>
          </div>

          <div className="flex-[1.5] flex flex-col items-center">
            <div className="w-full flex items-center gap-4 mb-3">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#333333] to-[#333333]" />
              <div className="w-2 h-2 rounded-full bg-[#333333]" />
              <Train size={18} className="text-[#555555] animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-[#333333]" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#333333] to-[#333333]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-white/5">
              <Clock size={12} className="text-[#A1A1A1]" />
              <span className="text-[11px] font-bold text-white tracking-tight">{train.legDuration || (train.duration ? `${train.duration.hours}h ${train.duration.minutes}m` : '—')}</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-right">
            <p className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-2">Arrival</p>
            <h4 className="text-3xl font-black text-white mb-1 tabular-nums tracking-tighter">{train.arrivalTime}</h4>
            <p className="text-sm font-medium text-white/60">{train.toStation?.stationName || train.destinationStation?.name} ({train.toStation?.stationCode || train.destinationStation?.code})</p>
          </div>
        </div>

        {/* Features Row */}
        <div className="flex flex-wrap gap-4 mb-10 pb-10 border-b border-white/5">
          <div className="flex items-center gap-2 text-[#A1A1A1]">
            <Coffee size={14} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Pantry Available</span>
          </div>
          <div className="flex items-center gap-2 text-[#A1A1A1]">
            <Shield size={14} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Travel Insurance Opt-in</span>
          </div>
        </div>

        {/* Class Availability Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {train.classes.map((cls) => (
            <button
              key={cls.type}
              onClick={() => onBook(train, cls)}
              disabled={cls.availableSeats === 0}
              className={`p-4 rounded-2xl border transition-all duration-300 text-left relative group/btn overflow-hidden ${
                cls.availableSeats === 0 
                  ? 'bg-[#0A0A0A] border-[#111111] opacity-50 cursor-not-allowed'
                  : 'bg-[#1A1A1A] border-white/5 hover:border-white/20 active:scale-95'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-lg font-black text-white">{cls.type}</span>
                <span className="text-sm font-bold text-white/80">₹{cls.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-[10px] font-black uppercase tracking-widest ${getAvailabilityColor(cls.availableSeats)}`}>
                  {cls.availableSeats === 0 ? 'Waitlist' : `AVL ${cls.availableSeats}`}
                </div>
              </div>
              <div className="absolute right-3 bottom-3 opacity-0 group-hover/btn:opacity-100 transition-opacity">
                <ArrowRight size={14} className="text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TrainCard;
