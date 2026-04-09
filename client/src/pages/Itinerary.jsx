// src/pages/Itinerary.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyItineraries, saveItinerary, updateCurrentItinerary, resetCurrentItinerary } from '../features/itinerarySlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Plus, Save, Share2, Sun, Cloud, CloudRain, Trash2, ChevronRight, Plane, Hotel, Terminal, History, Database } from 'lucide-react';

const Itinerary = () => {
  const dispatch = useDispatch();
  const { currentItinerary, savedItineraries, isLoading } = useSelector((state) => state.auth.user ? state.itineraries : { currentItinerary: {}, savedItineraries: [], isLoading: false });
  const [activeTab, setActiveTab] = useState('planner');
  const [showTerminal, setShowTerminal] = useState(false);
  const [selectedPnr, setSelectedPnr] = useState(null);

  useEffect(() => {
    dispatch(getMyItineraries());
  }, [dispatch]);

  const handleSave = () => {
     dispatch(saveItinerary(currentItinerary));
     // Logic for success/reset would follow
  };

  const dayDates = [];
  if (currentItinerary.dateRange.startDate && currentItinerary.dateRange.endDate) {
     const start = new Date(currentItinerary.dateRange.startDate);
     const end = new Date(currentItinerary.dateRange.endDate);
     for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        dayDates.push(new Date(d));
     }
  }

  const GdsTerminal = ({ itinerary }) => {
    if (!itinerary) return null;
    
    const pnr = itinerary.pnr || 'UNKNWN';
    const lines = [
      `RP/BLR1A0980/BLR1A0980            ${new Date().toISOString().substring(0,10).replace(/-/g,'')} / ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}`,
      `1.SHARMA/RAJ MR`,
      ` 2 ${itinerary.flights?.[0]?.airline || 'AI'} ${itinerary.flights?.[0]?.flightNumber || '101'} Y ${new Date(itinerary.dateRange.startDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}).toUpperCase().replace(/ /g,'')} ${itinerary.origin || 'DEL'}${itinerary.destinationCode || 'BOM'} HK1  ${new Date(itinerary.dateRange.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}).replace(':','')} ${new Date(itinerary.dateRange.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}).replace(':','')}*`,
      ` 3 HTL ${itinerary.hotels?.[0]?.name?.substring(0,15).toUpperCase() || 'GRAND HYATT'} IN ${new Date(itinerary.dateRange.startDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}).toUpperCase().replace(/ /g,'')} OUT ${new Date(itinerary.dateRange.endDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short'}).toUpperCase().replace(/ /g,'')} /NM-SHARMA RAJ MR`,
      ` 4 AP BLR 91 9886000000 - A`,
      ` 5 TK OK09APR/BLR1A0980`,
      ` 6 FE PAX AMADEUS RECOGNITION`,
      ` 7 FP CASH`,
      ` 8 FV AI`,
      ` 9 OK ${pnr}`
    ];

    return (
      <div className="bg-black/90 p-8 rounded-2xl border border-accent/20 font-mono text-[11px] leading-relaxed shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
        <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
           <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
           </div>
           <span className="text-[9px] text-textMuted font-black uppercase tracking-widest ml-4">Amadeus Selling Platform Connect // GDS-CORE-v2.4</span>
        </div>
        <div className="space-y-1">
          {lines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="text-accent/30 select-none w-4">{i + 1}</span>
              <span className="text-white/80 group-hover:text-cyan-400 transition-colors duration-500">{line}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between text-[9px] text-textMuted font-bold">
           <span>{pnr} ACTIVE</span>
           <span className="animate-pulse">_ TERMINAL_ID: BLR_442_A</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Helmet>
        <title>Itinerary Planner | TravelDesk</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
         <div>
            <h2 className="text-4xl font-heading font-black tracking-tighter mb-2 uppercase">Trip Planner</h2>
            <p className="text-textMuted font-bold uppercase tracking-widest text-xs">Architect your perfect getaway, day by day.</p>
         </div>
         <div className="flex gap-4">
            <button
               onClick={() => setActiveTab('planner')}
               className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border
                  ${activeTab === 'planner' ? 'bg-accent border-accent text-background shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted'}
               `}
            >
               Create New
            </button>
            <button
               onClick={() => setActiveTab('saved')}
               className={`px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border
                  ${activeTab === 'saved' ? 'bg-accent border-accent text-background shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10 text-textMuted'}
               `}
            >
               My Trips
            </button>
            <button
                onClick={() => setShowTerminal(!showTerminal)}
                className={`p-3 rounded-xl font-bold border transition-all flex items-center gap-2
                   ${showTerminal ? 'bg-secondary border-secondary text-background' : 'bg-white/5 border-white/10 text-textMuted hover:border-accent/40'}
                `}
                title="Toggle GDS Terminal View"
             >
                <Terminal size={18} />
                <span className="text-[10px] uppercase tracking-widest font-black hidden sm:inline">GDS Control</span>
             </button>
         </div>
      </div>

      <AnimatePresence mode="wait">
         {showTerminal ? (
             <motion.div
                key="terminal"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto"
             >
                <div className="mb-8 flex items-center gap-4 bg-accent/5 p-4 rounded-xl border border-accent/20">
                   <div className="p-3 bg-accent/10 rounded-lg">
                      <History size={20} className="text-accent" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Master PNR Record</h3>
                      <p className="text-[10px] text-textMuted font-bold uppercase">Direct GDS Injection from Amadeus Core Systems</p>
                   </div>
                </div>
                <GdsTerminal itinerary={activeTab === 'planner' ? currentItinerary : (savedItineraries.length > 0 ? savedItineraries[0] : null)} />
             </motion.div>
          ) : activeTab === 'planner' ? (
            <motion.div
               key="planner"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
               {/* Left Controls */}
               <div className="space-y-8">
                  <div className="glass-card">
                     <h4 className="text-sm font-heading font-black text-accent uppercase tracking-[0.2em] mb-6">Trip Basics</h4>
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-textMuted tracking-widest">Itinerary Title</label>
                           <input
                              type="text"
                              placeholder="e.g. Summer in Tokyo"
                              className="input-field"
                              value={currentItinerary.title}
                              onChange={(e) => dispatch(updateCurrentItinerary({ title: e.target.value }))}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-textMuted tracking-widest">Destination</label>
                           <div className="relative">
                              <input
                                 type="text"
                                 placeholder="City, Country"
                                 className="input-field pl-10"
                                 value={currentItinerary.destination}
                                 onChange={(e) => dispatch(updateCurrentItinerary({ destination: e.target.value }))}
                              />
                              <MapPin size={16} className="absolute left-4 top-3.5 text-accent" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-textMuted tracking-widest">Start Date</label>
                              <input
                                 type="date"
                                 className="input-field"
                                 value={currentItinerary.dateRange.startDate}
                                 onChange={(e) => dispatch(updateCurrentItinerary({ dateRange: { ...currentItinerary.dateRange, startDate: e.target.value } }))}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-textMuted tracking-widest">End Date</label>
                              <input
                                 type="date"
                                 className="input-field"
                                 value={currentItinerary.dateRange.endDate}
                                 onChange={(e) => dispatch(updateCurrentItinerary({ dateRange: { ...currentItinerary.dateRange, endDate: e.target.value } }))}
                              />
                           </div>
                        </div>
                        <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-3">
                           <Save size={18} />
                           Save Discovery
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Timeline View */}
               <div className="lg:col-span-2 space-y-6">
                  {dayDates.length > 0 ? (
                    <div className="space-y-8">
                      {dayDates.map((date, i) => (
                        <div key={i} className="relative pl-12 border-l border-white/5 pb-12">
                           {/* Day Node */}
                           <div className="absolute top-0 left-[-16px] w-8 h-8 rounded-full bg-surface border-2 border-accent flex items-center justify-center text-[10px] font-black text-accent">
                              D{i+1}
                           </div>
                           
                           {/* Day Header */}
                           <div className="flex items-center justify-between mb-6">
                              <div>
                                 <h4 className="text-xl font-heading font-black text-white">{date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                                 <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{date.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                              </div>
                              <div className="flex items-center gap-2 p-3 rounded-2xl bg-accent/5 border border-accent/20">
                                 <Sun size={18} className="text-secondary animate-spin-slow" />
                                 <span className="text-sm font-mono font-black text-white">24°C</span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="glass-card bg-white/5 border-dashed border-white/10 hover:border-accent/30 transition-all cursor-pointer p-4 flex items-center justify-center gap-3">
                                 <Plus size={16} className="text-accent" />
                                 <span className="text-[10px] font-black text-textMuted uppercase tracking-[0.15em]">Add Attraction</span>
                              </div>
                              <div className="glass-card bg-white/5 border-dashed border-white/10 hover:border-secondary/30 transition-all cursor-pointer p-4 flex items-center justify-center gap-3">
                                 <Plus size={16} className="text-secondary" />
                                 <span className="text-[10px] font-black text-textMuted uppercase tracking-[0.15em]">Sync Booking</span>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-24 text-center glass-card">
                       <p className="text-textMuted uppercase tracking-[0.2em] font-black text-[10px]">Select dates to visualize your journey.</p>
                    </div>
                  )}
               </div>
            </motion.div>
         ) : (
            <motion.div
               key="saved"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
               {savedItineraries.length > 0 ? (
                  savedItineraries.map((it, idx) => (
                    <div key={it._id} className="glass-card flex flex-col group hover:border-accent/30 transition-all">
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                             <h4 className="text-xl font-heading font-black text-white">{it.title}</h4>
                             <button className="p-2 border border-white/5 rounded-lg text-textMuted hover:text-red-500 hover:bg-red-500/10 transition-all">
                                <Trash2 size={16} />
                             </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest">
                             <MapPin size={14} />
                             {it.destination}
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="p-2.5 px-3 bg-white/5 rounded-xl text-[10px] font-mono text-textMuted uppercase tracking-widest font-black">
                                {new Date(it.dateRange.startDate).toLocaleDateString()} - {new Date(it.dateRange.endDate).toLocaleDateString()}
                             </div>
                             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent/10 border border-accent/20">
                                <Database size={10} className="text-accent" />
                                <span className="text-[9px] font-black font-mono text-accent">{it.pnr || 'SYNCING'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="mt-8 pt-4 border-t border-white/5 flex gap-2">
                          <button className="flex-1 py-3 bg-white/5 hover:bg-accent hover:text-background transition-all rounded-xl border border-white/5 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                             <Share2 size={14} /> Share
                          </button>
                          <button className="flex-1 py-3 bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-background transition-all rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                             Details <ChevronRight size={14} />
                          </button>
                       </div>
                    </div>
                  ))
               ) : (
                  <div className="col-span-full py-24 text-center glass-card border-dashed">
                     <p className="text-textMuted uppercase tracking-widest text-[10px] font-black font-heading">No saved adventures yet.</p>
                  </div>
               )}
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Itinerary;
