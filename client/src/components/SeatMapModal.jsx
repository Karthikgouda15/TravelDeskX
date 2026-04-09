// src/components/SeatMapModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Timer, AlertCircle, Crown, Star, Users } from 'lucide-react';
import { setCheckoutData, setStep } from '../features/bookingSlice';
import { useNavigate } from 'react-router-dom';

const CABIN_ZONES = [
  { key: 'first',    label: 'First Class',    rows: [1, 2],   icon: Crown,  bg: 'bg-white/10 border-white/20',  textColor: 'text-white',      priceMultiplier: 3.0 },
  { key: 'business', label: 'Business',        rows: [3, 6],   icon: Star,   bg: 'bg-white/5 border-white/10',   textColor: 'text-white/80',   priceMultiplier: 2.0 },
  { key: 'economy',  label: 'Economy',         rows: [7, 999], icon: Users,  bg: 'bg-white/[0.02] border-white/5', textColor: 'text-white/60',   priceMultiplier: 1.0 },
];

const SeatMapModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedFlight } = useSelector((state) => state.flights);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [timer, setTimer] = useState(600);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    let interval;
    if (isHolding && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setIsHolding(false);
    }
    return () => clearInterval(interval);
  }, [isHolding, timer]);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) { setSelectedSeats([]); setTimer(600); setIsHolding(false); }
  }, [isOpen]);

  if (!selectedFlight) return null;

  const rows = Math.ceil(selectedFlight.totalSeats / 6);
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getZoneForRow = (rowIndex) => {
    const row = rowIndex + 1;
    return CABIN_ZONES.find(z => row >= z.rows[0] && row <= z.rows[1]) || CABIN_ZONES[2];
  };

  const getSeatPrice = (rowIndex) => {
    const zone = getZoneForRow(rowIndex);
    return Math.round(selectedFlight.price * zone.priceMultiplier);
  };

  const toggleSeat = (seatNum, rowIndex) => {
    const maxSeats = selectedFlight.availableSeats < 6 ? selectedFlight.availableSeats : 6;
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= maxSeats) return;
      setSelectedSeats([...selectedSeats, seatNum]);
      setIsHolding(true);
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((sum, seatNum) => {
      const rowNum = parseInt(seatNum);
      const rowIndex = rowNum - 1;
      return sum + getSeatPrice(rowIndex);
    }, 0);
  };

  const handleProceed = () => {
    dispatch(setCheckoutData({
      flight: selectedFlight,
      selectedSeats,
      totalPrice: getTotalPrice(),
      currentStep: 1,
    }));
    navigate('/checkout');
    onClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Group rows by cabin zone
  const zoneGroups = CABIN_ZONES.map(zone => ({
    ...zone,
    rowRange: Array.from({ length: Math.min(zone.rows[1], rows) - zone.rows[0] + 1 }, (_, i) => i + zone.rows[0] - 1)
      .filter(i => i >= 0 && i < rows),
  })).filter(z => z.rowRange.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/85 backdrop-blur-md" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22 }}
            className="glass w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-2xl font-heading font-black uppercase tracking-tighter">Select Your Seats</h3>
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  <span className="text-xs text-textMuted font-bold uppercase tracking-widest">
                    {selectedFlight.airline}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded font-mono font-bold text-textMuted">
                    {selectedFlight.flightNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-white/10 border border-white/20 rounded font-black text-white uppercase">
                    {selectedFlight.cabinClass}
                  </span>
                  <span className="text-[10px] text-textMuted font-bold">
                    {selectedFlight.origin} → {selectedFlight.destination}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Seat Map Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-surface/30">
              <div className="max-w-xl mx-auto space-y-4">

                {/* Airplane nose */}
                <div className="w-full h-16 bg-white/3 rounded-t-[80px] border-x border-t border-white/8 flex items-end justify-center pb-3">
                  <div className="w-10 h-0.5 bg-white/15 rounded-full" />
                </div>

                {/* Legend */}
                <div className="flex justify-center flex-wrap gap-4 py-2">
                  {[
                    { label: 'Available', cls: 'bg-white/8 border-white/20' },
                    { label: 'Selected',  cls: 'bg-white border-white text-black' },
                    { label: 'Booked',    cls: 'bg-white/3 border-white/8 opacity-20' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border ${item.cls}`} />
                      <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Cabin Zone Groups */}
                {zoneGroups.map((zone) => {
                  const ZoneIcon = zone.icon;
                  return (
                    <div key={zone.key} className={`rounded-2xl border p-4 space-y-3 ${zone.bg}`}>
                      {/* Zone header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ZoneIcon size={14} className={zone.textColor} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${zone.textColor}`}>
                            {zone.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-black text-textMuted">
                          from ₹{(selectedFlight.price * zone.priceMultiplier).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      {/* Rows in this zone */}
                      <div className="space-y-2">
                        {zone.rowRange.map((rowIndex) => (
                          <div key={rowIndex} className="flex items-center justify-center gap-3">
                            <div className="w-5 text-[9px] font-mono text-textMuted font-bold text-right">{rowIndex + 1}</div>

                            {/* Left 3 seats */}
                            <div className="flex gap-1.5">
                              {seatLetters.slice(0, 3).map(letter => {
                                const seatNum = `${rowIndex + 1}${letter}`;
                                const isSelected = selectedSeats.includes(seatNum);
                                // Simulate ~20% booked seats deterministically
                                const isBooked = ((rowIndex * 6 + seatLetters.indexOf(letter)) % 5 === 0) && !isSelected;
                                return (
                                  <button
                                    key={letter}
                                    onClick={() => !isBooked && toggleSeat(seatNum, rowIndex)}
                                    disabled={isBooked}
                                    title={isBooked ? 'Seat booked' : `Seat ${seatNum}`}
                                    className={`w-9 h-9 rounded-lg border transition-all text-[10px] font-mono font-black flex items-center justify-center
                                      ${isBooked
                                        ? 'bg-white/[0.02] border-white/5 text-textMuted opacity-20 cursor-not-allowed'
                                        : isSelected
                                          ? 'bg-white border-white text-black scale-105'
                                          : 'bg-white/5 border-white/15 text-white hover:border-white/50 hover:bg-white/10'
                                      }
                                    `}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Aisle */}
                            <div className="w-5" />

                            {/* Right 3 seats */}
                            <div className="flex gap-1.5">
                              {seatLetters.slice(3).map(letter => {
                                const seatNum = `${rowIndex + 1}${letter}`;
                                const isSelected = selectedSeats.includes(seatNum);
                                const isBooked = ((rowIndex * 6 + seatLetters.indexOf(letter) + 3) % 7 === 0) && !isSelected;
                                return (
                                  <button
                                    key={letter}
                                    onClick={() => !isBooked && toggleSeat(seatNum, rowIndex)}
                                    disabled={isBooked}
                                    title={isBooked ? 'Seat booked' : `Seat ${seatNum}`}
                                    className={`w-9 h-9 rounded-lg border transition-all text-[10px] font-mono font-black flex items-center justify-center
                                      ${isBooked
                                        ? 'bg-white/3 border-white/8 text-textMuted opacity-40 cursor-not-allowed'
                                        : isSelected
                                          ? 'bg-accent border-accent text-background shadow-[0_0_12px_rgba(0,212,200,0.4)] scale-105'
                                          : 'bg-white/5 border-white/15 text-white hover:border-accent/50 hover:bg-accent/10'
                                      }
                                    `}
                                  >
                                    {letter}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Airplane tail */}
                <div className="w-full h-10 bg-white/3 rounded-b-[80px] border-x border-b border-white/8" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 bg-surface/50 shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">Selected Seats</p>
                    <h4 className="text-lg font-heading font-black text-white">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                    </h4>
                  </div>
                  {isHolding && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                      <Timer className="text-white animate-pulse" size={16} />
                      <span className="text-sm font-mono font-black text-white">{formatTime(timer)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">Total</p>
                    <p className="text-2xl font-mono font-black text-white">
                      ₹{getTotalPrice().toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={handleProceed}
                    className="btn-primary flex items-center gap-2 px-8 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span className="uppercase tracking-widest text-sm font-black">Checkout</span>
                    <Check size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SeatMapModal;
