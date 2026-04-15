// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/TrainToolsModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Train, MapPin, Navigation, User, Calendar, CheckCircle2, AlertCircle, Search } from 'lucide-react';

const TrainToolsModal = ({ isOpen, onClose, type, data, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-8 top-8 p-2 rounded-full bg-white/5 border border-white/10 text-[#A1A1A1] hover:text-white transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              {type === 'pnr' ? <Search size={24} /> : <Navigation size={24} />}
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {type === 'pnr' ? 'PNR Status' : 'Live Running Status'}
              </h2>
              <p className="text-sm font-medium text-[#A1A1A1]">Real-time intelligence from IRCTC</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/5 border-t-white rounded-full animate-spin mb-6" />
              <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Fetching data...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {type === 'pnr' ? (
                <div className="space-y-8">
                  {/* PNR Header */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-1">Train</p>
                        <p className="text-lg font-black text-white">{data.trainName}</p>
                        <p className="text-xs font-medium text-[#A1A1A1]">#{data.trainNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-1">Status</p>
                        <p className="text-lg font-black text-green-500 uppercase">{data.chartStatus}</p>
                      </div>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 px-1">Passengers</h3>
                    <div className="space-y-2">
                      {data.passengers.map((p, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-[#1A1A1A] border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#A1A1A1]">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{p.name}</p>
                              <p className="text-[10px] font-medium text-[#A1A1A1]">{p.age} {p.gender}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-white">{p.currentStatus}</p>
                            <p className="text-[10px] font-medium text-green-500 uppercase tracking-wider">{p.bookingStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Live Status Header */}
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white">{data.status}</p>
                        <p className="text-sm font-medium text-orange-500">{data.delay}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-1">Current Position</p>
                      <p className="text-sm font-bold text-white">{data.currentStation}</p>
                    </div>
                  </div>

                  {/* Route progress */}
                  <div className="space-y-4">
                    {data.stops.map((stop, i) => (
                      <div key={i} className="flex gap-6 relative">
                        {i !== data.stops.length - 1 && (
                          <div className="absolute left-[15px] top-8 bottom-[-8px] w-0.5 bg-white/5" />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          stop.status === 'Departed' ? 'bg-green-500 text-black' : 'bg-[#1A1A1A] text-[#444444]'
                        }`}>
                          {stop.status === 'Departed' ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <h4 className={`text-sm font-bold ${stop.status === 'Upcoming' ? 'text-[#555555]' : 'text-white'}`}>
                              {stop.station}
                            </h4>
                            <div className="text-right">
                              <p className="text-sm font-black text-white">{stop.time}</p>
                              {stop.delay !== "0" && <p className="text-[10px] font-bold text-orange-500">+{stop.delay}m</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-[#A1A1A1] font-medium">No results found for this query.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TrainToolsModal;
