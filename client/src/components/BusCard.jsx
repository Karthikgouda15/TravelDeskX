// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/BusCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, Clock, MapPin, Star, Wifi, Battery, Coffee, 
  Shield, ArrowRight, ChevronDown, Info, AlertCircle 
} from 'lucide-react';

const amenityIcons = {
  'WiFi': Wifi,
  'Charging Point': Battery,
  'Water Bottle': Coffee,
  'CCTV': Shield,
  'Blanket': Info,
  'GPS': MapPin
};

const BusCard = ({ bus, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'amenities', 'policy'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-[32px] overflow-hidden transition-all group"
    >
      <div className="p-8 pb-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Operator Info */}
          <div className="lg:w-1/4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                <Bus size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{bus.operatorName}</h3>
                <p className="text-[11px] font-bold text-[#A1A1A1] uppercase tracking-widest">{bus.busType}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-white">{bus.rating}</span>
              </div>
              <span className="text-[11px] font-medium text-[#555555]">{bus.reviewsCount} Reviews</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:w-2/4 flex items-center justify-between px-4">
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">
                {new Date(bus.origin.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-sm font-bold text-[#A1A1A1]">{bus.origin.city}</div>
              <div className="text-[10px] font-black text-[#555555] uppercase mt-1 max-w-[100px] truncate mx-auto">
                {bus.origin.stationName}
              </div>
            </div>

            <div className="flex-1 px-8 relative">
              <div className="flex items-center justify-center mb-2">
                {(() => {
                  const start = new Date(bus.origin.departureTime);
                  const end = new Date(bus.destination.arrivalTime);
                  const diff = Math.abs(end - start) / (1000 * 60); // minutes
                  const hours = Math.floor(diff / 60);
                  const mins = Math.floor(diff % 60);
                  return (
                    <div className="text-[10px] font-bold text-[#555555] uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={10} />
                      {hours}h {mins}m
                    </div>
                  );
                })()}
              </div>
              <div className="relative h-[2px] w-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">
                {new Date(bus.destination.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
              </div>
              <div className="text-sm font-bold text-[#A1A1A1]">{bus.destination.city}</div>
              <div className="text-[10px] font-black text-[#555555] uppercase mt-1 max-w-[100px] truncate mx-auto">
                {bus.destination.stationName}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="lg:w-1/4 flex flex-col justify-between items-end">
            <div className="text-right">
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-sm font-bold text-[#555555]">₹</span>
                <span className="text-4xl font-black text-white tracking-tighter">{bus.price}</span>
              </div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${bus.availableSeats < 10 ? 'text-red-400 bg-red-400/5' : 'text-[#A1A1A1] bg-white/5'}`}>
                  {bus.availableSeats} Seats Left
                </div>
              </div>
            </div>

            <button 
              onClick={() => onSelect(bus)}
              className="mt-6 w-full py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Select Seats
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick View Controls */}
        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-6">
            <button 
              onClick={() => { setIsExpanded(!isExpanded); setActiveTab('points'); }}
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isExpanded && activeTab === 'points' ? 'text-white' : 'text-[#555555] hover:text-[#A1A1A1]'}`}
            >
              Journey Details
            </button>
            <button 
              onClick={() => { setIsExpanded(!isExpanded); setActiveTab('amenities'); }}
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isExpanded && activeTab === 'amenities' ? 'text-white' : 'text-[#555555] hover:text-[#A1A1A1]'}`}
            >
              Amenities
            </button>
            <button 
              onClick={() => { setIsExpanded(!isExpanded); setActiveTab('policy'); }}
              className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isExpanded && activeTab === 'policy' ? 'text-white' : 'text-[#555555] hover:text-[#A1A1A1]'}`}
            >
              Policies
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {bus.amenities.slice(0, 3).map(amenity => {
              const Icon = amenityIcons[amenity] || Info;
              return <Icon key={amenity} size={14} className="text-[#555555]" />;
            })}
            <ChevronDown 
              size={16} 
              className={`text-[#555555] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Expandable Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white/[0.02]"
          >
            <div className="p-8 border-t border-white/5">
              {activeTab === 'points' && (
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Boarding Points
                    </h4>
                    <div className="space-y-6">
                      {bus.boardingPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="text-sm font-black text-white w-12">{point.time}</div>
                          <div>
                            <div className="text-sm font-bold text-white">{point.name}</div>
                            <div className="text-[11px] font-medium text-[#555555] mt-1">{point.landmark}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-6 px-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Dropping Points
                    </h4>
                    <div className="space-y-6">
                      {bus.droppingPoints.map((point, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="text-sm font-black text-white w-12">{point.time}</div>
                          <div>
                            <div className="text-sm font-bold text-white">{point.name}</div>
                            <div className="text-[11px] font-medium text-[#555555] mt-1">{point.landmark}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div className="grid grid-cols-4 gap-6">
                  {bus.amenities.map(amenity => {
                    const Icon = amenityIcons[amenity] || Info;
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl">
                        <Icon size={18} className="text-white" />
                        <span className="text-xs font-bold text-white">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'policy' && (
                <div className="max-w-xl">
                  <div className="flex items-start gap-4 p-6 bg-white/5 rounded-2xl">
                    <AlertCircle size={20} className="text-white mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-white mb-2">Cancellation Policy</h4>
                      <p className="text-sm font-medium text-[#A1A1A1] leading-relaxed">
                        {bus.cancellationPolicy}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BusCard;
