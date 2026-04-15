// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/StationAutocomplete.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Train } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const StationAutocomplete = ({ value, onChange, placeholder, label, icon: Icon = MapPin }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/trains/stations?q=${query}`);
        setSuggestions(response.data.data);
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchStations, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (station) => {
    onChange(`${station.name} (${station.code})`);
    setQuery(`${station.name} (${station.code})`);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="block text-[11px] font-bold text-[#A1A1A1] uppercase tracking-widest mb-2 px-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1A1] transition-colors group-focus-within:text-white">
          <Icon size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-[#111111]/80 backdrop-blur-xl border border-[#1A1A1A] hover:border-[#333333] focus:border-white/20 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-[#555555] outline-none transition-all text-sm font-medium"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/10 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute z-[100] w-full mt-2 py-2 bg-[#111111] border border-[#1A1A1A] rounded-xl shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            {suggestions.map((station, index) => (
              <button
                key={station.code + index}
                onClick={() => handleSelect(station)}
                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#A1A1A1] group-hover:bg-white/10 group-hover:text-white transition-all">
                  <Train size={14} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white tracking-tight">
                    {station.name}
                  </div>
                  <div className="text-[11px] font-medium text-[#A1A1A1] uppercase tracking-wider">
                    {station.code} • Indian Railways
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StationAutocomplete;
