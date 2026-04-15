import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Shield, ChevronRight, ChevronDown, Wifi, BriefcaseBusiness,
  TrendingUp, TrendingDown, Luggage, Receipt
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export const fareIntelligence = (flightDate) => {
  const daysAway = Math.floor((new Date(flightDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysAway <= 3)  return { icon: TrendingUp,   text: 'Prices peaking — book now!',   cls: 'text-white bg-white/10 border-white/20 font-bold' };
  if (daysAway <= 14) return { icon: TrendingUp,   text: 'Fares rising — high demand',    cls: 'text-white/60 bg-white/5 border-white/10' };
  return               { icon: TrendingDown, text: 'Prime window — best time to buy', cls: 'text-white/40 bg-white/[0.02] border-white/5' };
};

const FlightCard = React.memo(({ flight, index, isRecommendation, onSelect, isExpanded, onToggle, isLanding = false }) => {
  const intel = fareIntelligence(flight.departureTime);
  const IntelIcon = intel.icon;
  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);
  const isUrgent = flight.availableSeats <= 5;

  // Mocked details for premium feel
  const baseFare = Math.floor(flight.price * 0.82);
  const taxes = flight.price - baseFare;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.06, type: 'spring', damping: 25, stiffness: 120 }}
      className={`glass-card mb-4 group cursor-pointer overflow-hidden relative transition-all
        ${isRecommendation ? 'border-dashed border-white/10' : 'hover:border-white/30'}
        ${isExpanded ? 'border-white shadow-[0_0_30px_rgba(255,255,255,0.05)] ring-1 ring-white/10' : ''}
      `}
      onClick={onToggle}
    >
      {/* Recommended / Assured badge */}
      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl z-20 flex items-center gap-1 border-b border-l
        ${isRecommendation
          ? 'bg-white/5 border-white/10'
          : 'bg-white/10 border-white/20'
        }
      `}>
        {isRecommendation
          ? <span className="text-[9px] font-black uppercase tracking-tighter text-white/40">Suggested: {depTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          : <><Shield size={10} className="text-white" /><span className="text-[9px] font-black uppercase tracking-tighter text-white">TravelDesk Assured</span></>
        }
      </div>

      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/5 transition-opacity pointer-events-none ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

      <div className="flex flex-col gap-3 relative z-10 pt-2">
        {/* Main row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 md:px-6">

          {/* Airline info */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 transition-all ${isExpanded ? 'scale-110 border-accent/40 shadow-lg' : ''}`}>
              {flight.airlineLogo
                ? <img src={flight.airlineLogo} alt={flight.airline} className="w-full h-full object-contain p-1.5 transition-transform duration-500" />
                : <Plane size={20} className="text-white transition-transform" />
              }
            </div>
            <div>
              <h4 className="font-heading font-black text-base">{flight.airline}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-textMuted uppercase">{flight.flightNumber}</span>
                <span className="text-[9px] font-black uppercase text-white/60 tracking-tighter">{flight.cabinClass}</span>
              </div>
            </div>
          </div>

          {/* Route timeline */}
          <div className="flex items-center gap-8 flex-1 justify-center max-w-sm mx-auto">
            <div className="text-right">
              <p className="text-2xl font-mono font-black tabular-nums leading-tight">{depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-sm font-bold text-white mt-1">{flight.originCity || flight.origin}</p>
              <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{flight.origin}</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[80px]">
              <p className="text-[10px] font-black text-white uppercase tracking-tighter">
                {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
              </p>
              <div className="relative w-full flex items-center">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-white/60 bg-black shrink-0" />
                <div className="flex-1 h-[2px] bg-gradient-to-r from-white/20 via-white/5 to-white/20 mx-1" />
                <Plane size={14} className="text-white/40 shrink-0 transform rotate-90" />
              </div>
              <p className="text-[10px] font-black text-textMuted uppercase tracking-wider">
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="text-left">
              <p className="text-2xl font-mono font-black tabular-nums leading-tight">{arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-sm font-bold text-white mt-1">{flight.destinationCity || flight.destination}</p>
              <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{flight.destination}</p>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="flex flex-col items-end gap-2 shrink-0 md:min-w-[160px]">
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xs font-bold text-textMuted">₹</span>
                <span className="text-3xl font-mono font-black text-secondary tabular-nums tracking-tighter">{flight.price.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[9px] text-textMuted font-bold uppercase tracking-tighter">all inclusive fee</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={flight.status} />
              {isUrgent && (
                <span className="text-[9px] font-black uppercase text-white bg-white/10 border border-white/20 px-1.5 py-0.5 rounded animate-pulse">
                  Only {flight.availableSeats} left
                </span>
              )}
            </div>
            <button
              className="btn-primary w-full py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-1 shadow-lg shadow-accent/10"
              onClick={(e) => { e.stopPropagation(); onSelect(flight); }}
            >
              {isLanding ? 'Book / Login' : 'Book Now'} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Info pills strip */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 px-6 pb-2">
          <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors ${intel.cls}`}>
            <IntelIcon size={11} />
            {intel.text}
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-textMuted">
            <span className="flex items-center gap-1.5"><Wifi size={10} className="text-white/40" />Free Wi-Fi</span>
            <span className="flex items-center gap-1.5"><BriefcaseBusiness size={10} className="text-white/40" />15 kg Cabin</span>
            <span className="flex items-center gap-1.5"><Shield size={10} className="text-white/40" />₹0 Cancellation</span>
            <span className={`flex items-center gap-1 transition-transform ${isExpanded ? 'rotate-180 text-accent' : ''}`}>
              <ChevronDown size={14} />
            </span>
          </div>
        </div>

        {/* Expansion Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="overflow-hidden border-t border-white/5 bg-white/[0.02]"
            >
              <div className="p-6 pt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Flight Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <Plane size={14} />
                      <h5 className="text-[10px] font-black uppercase tracking-widest">Flight Info</h5>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Flight Class</span>
                        <span className="font-bold text-white capitalize">{flight.cabinClass}</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Aircraft</span>
                        <span className="font-bold text-white">Airbus A320neo</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Available Seats</span>
                        <span className="font-bold text-white">{flight.availableSeats} / {flight.totalSeats}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Baggage & Policies */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <Luggage size={14} />
                      <h5 className="text-[10px] font-black uppercase tracking-widest">Baggage & Rules</h5>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Cabin Baggage</span>
                        <span className="font-bold text-white">7 kg / Person</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Check-in Baggage</span>
                        <span className="font-bold text-white">15 kg / Person</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Cancellation</span>
                        <span className="font-bold text-white">Refundable Fee ₹0</span>
                      </li>
                    </ul>
                  </div>

                  {/* Fare Summary */}
                  <div className="space-y-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2 text-white">
                      <Receipt size={14} />
                      <h5 className="text-[10px] font-black uppercase tracking-widest">Fare Summary</h5>
                    </div>
                    <ul className="space-y-2 pb-3 border-b border-white/5">
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Base Fare</span>
                        <span className="font-mono text-white">₹{baseFare.toLocaleString('en-IN')}</span>
                      </li>
                      <li className="flex justify-between items-center text-xs">
                        <span className="text-textMuted">Taxes & Fees</span>
                        <span className="font-mono text-white">₹{taxes.toLocaleString('en-IN')}</span>
                      </li>
                    </ul>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-widest text-white">Total Cost</span>
                      <span className="text-xl font-mono font-black text-secondary">₹{flight.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Confirm Action */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-textMuted uppercase tracking-widest">
                    <Shield size={14} className="text-white/40" />
                    Secure Checkout with end-to-end encryption
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSelect(flight); }}
                    className="btn-primary px-8 py-3 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 transition-transform"
                  >
                    Select Seats & Proceed
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default FlightCard;
