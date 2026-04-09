// src/components/AirportAutocomplete.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, X } from 'lucide-react';
import airports from '../data/airports.json';

/**
 * Premium airport search input with IATA typeahead.
 * Props:
 *  - value: string (city or IATA code)
 *  - onChange: fn(selectedAirport: { iata, city, name, flag })
 *  - placeholder: string
 *  - icon: React node
 *  - align: 'left' | 'right'  (label alignment)
 *  - label: string
 */
const AirportAutocomplete = ({ value, onChange, placeholder = 'City or Airport', label, icon, align = 'left', id }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Keep local query in sync with external value changes (e.g. swap)
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const search = useCallback((q) => {
    if (!q || q.length < 1) { setResults([]); return; }
    const lower = q.toLowerCase();
    const filtered = airports.filter(a =>
      a.iata.toLowerCase().includes(lower) ||
      a.city.toLowerCase().includes(lower) ||
      a.name.toLowerCase().includes(lower) ||
      a.country.toLowerCase().includes(lower)
    ).slice(0, 7);
    setResults(filtered);
    setHighlighted(0);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
    setIsOpen(true);
    // If cleared, notify parent
    if (!val) onChange({ iata: '', city: '', name: '', flag: '' });
  };

  const handleSelect = (airport) => {
    setQuery(`${airport.city} (${airport.iata})`);
    setResults([]);
    setIsOpen(false);
    onChange(airport);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); handleSelect(results[highlighted]); }
    if (e.key === 'Escape')    { setIsOpen(false); }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full" id={id}>
      {label && (
        <label className={`block text-[10px] uppercase font-black text-accent tracking-[0.2em] mb-1.5 ${align === 'right' ? 'text-right' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <div className={`absolute inset-y-0 ${align === 'right' ? 'right-4' : 'left-4'} flex items-center pointer-events-none`}>
          {icon || <Plane size={16} className="text-accent/50" />}
        </div>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck="false"
          value={query}
          onChange={handleInput}
          onFocus={() => { search(query); setIsOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`input-field w-full bg-white/5 border-white/10 text-sm ${align === 'right' ? 'pr-11 text-right' : 'pl-11'}`}
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); setResults([]); onChange({ iata: '', city: '', name: '', flag: '' }); inputRef.current?.focus(); }}
            className={`absolute inset-y-0 ${align === 'right' ? 'left-3' : 'right-3'} flex items-center text-textMuted hover:text-white transition-colors`}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[100] top-full mt-1 w-full min-w-[280px] bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {results.map((airport, i) => (
              <li
                key={airport.iata}
                onMouseDown={() => handleSelect(airport)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                  i === highlighted ? 'bg-accent/10 border-l-2 border-accent' : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <span className="text-xl leading-none">{airport.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono font-black text-accent text-sm">{airport.iata}</span>
                    <span className="font-semibold text-white text-sm truncate">{airport.city}</span>
                  </div>
                  <p className="text-[10px] text-textMuted truncate">{airport.name}</p>
                </div>
                <span className="text-[10px] text-textMuted font-bold uppercase shrink-0">{airport.country}</span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AirportAutocomplete;
