// src/components/FlightFilters.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { setFilters } from '../features/flightSlice';
import { SlidersHorizontal, RotateCcw, Circle, Minus, CheckSquare } from 'lucide-react';

const AIRLINES = ['IndiGo', 'Air India', 'Air India Express', 'Akasa Air', 'SpiceJet', 'Alliance Air'];
const STOPS = [
  { label: 'Non-stop', value: '0' },
  { label: '1 Stop', value: '1' },
  { label: '2+ Stops', value: '2+' },
];
const DEPARTURE_SLOTS = [
  { label: 'Early Morning', sub: '12AM – 6AM', value: 'night', icon: '🌙' },
  { label: 'Morning', sub: '6AM – 12PM', value: 'morning', icon: '🌅' },
  { label: 'Afternoon', sub: '12PM – 6PM', value: 'afternoon', icon: '☀️' },
  { label: 'Evening', sub: '6PM – 12AM', value: 'evening', icon: '🌆' },
];

const FlightFilters = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.flights);

  const toggleStop = (val) => {
    const current = filters.stops || [];
    const next = current.includes(val) ? current.filter(s => s !== val) : [...current, val];
    dispatch(setFilters({ stops: next }));
  };

  const toggleAirline = (name) => {
    const current = filters.airlines || [];
    const next = current.includes(name) ? current.filter(a => a !== name) : [...current, name];
    dispatch(setFilters({ airlines: next }));
  };

  const toggleSlot = (val) => {
    const current = filters.departureSlots || [];
    const next = current.includes(val) ? current.filter(s => s !== val) : [...current, val];
    dispatch(setFilters({ departureSlots: next }));
  };

  const resetFilters = () => {
    dispatch(setFilters({
      priceMax: 150000,
      stops: [],
      airlines: [],
      departureSlots: [],
      maxDuration: null,
    }));
  };

  const hasActiveFilters =
    (filters.stops?.length > 0) ||
    (filters.airlines?.length > 0) ||
    (filters.departureSlots?.length > 0) ||
    (filters.priceMax && filters.priceMax < 150000);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card border-white/5 space-y-8 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-accent" />
          <h3 className="font-heading font-bold uppercase tracking-widest text-sm">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-accent hover:text-white transition-colors tracking-widest"
          >
            <RotateCcw size={11} />
            Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Max Price</p>
        <input
          type="range"
          min="1000"
          max="150000"
          step="1000"
          value={filters.priceMax || 150000}
          onChange={(e) => dispatch(setFilters({ priceMax: Number(e.target.value) }))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer accent-accent bg-white/10"
        />
        <div className="flex justify-between text-xs font-mono text-accent">
          <span>₹1k</span>
          <span>₹{((filters.priceMax || 150000) / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Stops */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Stops</p>
        <div className="space-y-2">
          {STOPS.map(({ label, value }) => {
            const active = (filters.stops || []).includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleStop(value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-sm font-medium text-left
                  ${active ? 'border-accent/40 bg-accent/10 text-white' : 'border-white/8 bg-white/3 text-textMuted hover:border-white/20 hover:text-white'}`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 transition-colors ${active ? 'bg-accent border-accent' : 'border-white/20'}`}>
                  {active && <CheckSquare size={10} className="text-background" />}
                </div>
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Departure Time Slots */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Departure Time</p>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTURE_SLOTS.map(({ label, sub, value, icon }) => {
            const active = (filters.departureSlots || []).includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleSlot(value)}
                className={`flex flex-col items-center justify-center gap-0.5 p-2.5 rounded-xl border transition-all
                  ${active ? 'border-accent/40 bg-accent/10' : 'border-white/8 bg-white/3 hover:border-white/20'}`}
              >
                <span className="text-lg">{icon}</span>
                <span className={`text-[10px] font-black ${active ? 'text-accent' : 'text-white'}`}>{label}</span>
                <span className="text-[9px] text-textMuted">{sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Airlines */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Airlines</p>
        <div className="space-y-2">
          {AIRLINES.map((name) => {
            const active = (filters.airlines || []).includes(name);
            return (
              <button
                key={name}
                onClick={() => toggleAirline(name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-sm font-medium text-left
                  ${active ? 'border-accent/40 bg-accent/10 text-white' : 'border-white/8 bg-white/3 text-textMuted hover:border-white/20 hover:text-white'}`}
              >
                <div className={`w-4 h-4 rounded border shrink-0 transition-colors flex items-center justify-center ${active ? 'bg-accent border-accent' : 'border-white/20'}`}>
                  {active && <CheckSquare size={10} className="text-background" />}
                </div>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default FlightFilters;
