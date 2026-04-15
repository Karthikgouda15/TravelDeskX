import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Users, Shield, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import PassengerDetailsForm from './PassengerDetailsForm';

const SeatSelectionModal = ({ bus, isOpen, onClose, onConfirm }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [deck, setDeck] = useState('lower');
  const [step, setStep] = useState(1); // 1: Seats, 2: Passengers
  const [passengerDetails, setPassengerDetails] = useState({});

  const rows = bus?.seatLayout?.rows || 10;
  const cols = bus?.seatLayout?.columns || 4;
  const hasUpper = bus?.seatLayout?.hasUpperDeck || false;
  const bookedSeats = bus?.bookedSeats || [];

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
      const newDetails = { ...passengerDetails };
      delete newDetails[seatId];
      setPassengerDetails(newDetails);
    } else {
      if (selectedSeats.length >= 6) {
        alert('Maximum 6 seats allowed per booking');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatStatus = (seatId) => {
    if (bookedSeats.includes(seatId)) return 'booked';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const isFormValid = () => {
    return selectedSeats.every(id => 
      passengerDetails[id]?.name && 
      passengerDetails[id]?.age && 
      passengerDetails[id]?.gender
    );
  };

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm(Object.values(passengerDetails));
    }
  };

  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-[#0A0A0A] border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[90vh]"
      >
        {/* Left: Seat Preview / Forms */}
        <div className="lg:w-2/3 p-10 overflow-y-auto border-r border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent text-left">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              {step === 2 && (
                <button 
                  onClick={() => setStep(1)}
                  className="p-2 hover:bg-white/5 rounded-full text-[#A1A1A1] transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {step === 1 ? 'Select Seats' : 'Passenger Details'}
                </h2>
                <p className="text-sm font-medium text-[#555555] mt-1">{bus?.operatorName || 'Loading...'} • {bus?.busType}</p>
              </div>
            </div>
            
            {step === 1 && hasUpper && (
              <div className="flex p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setDeck('lower')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${deck === 'lower' ? 'bg-white text-black' : 'text-[#555555] hover:text-[#A1A1A1]'}`}
                >
                  Lower
                </button>
                <button
                  onClick={() => setDeck('upper')}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${deck === 'upper' ? 'bg-white text-black' : 'text-[#555555] hover:text-[#A1A1A1]'}`}
                >
                  Upper
                </button>
              </div>
            )}
          </div>

          {step === 1 ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Legend */}
              <div className="flex gap-8 mb-12 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-white/5 border border-white/10" />
                  <span className="text-[10px] font-black text-[#555555] uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-white" />
                  <span className="text-[10px] font-black text-[#555555] uppercase tracking-widest">Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-sm bg-red-400/20 border border-red-400/30" />
                  <span className="text-[10px] font-black text-[#555555] uppercase tracking-widest">Booked</span>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="relative mx-auto max-w-sm p-8 bg-white/[0.02] rounded-[48px] border border-white/5">
                <div className="absolute top-8 right-8 w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center rotate-45">
                  <div className="w-1 h-4 bg-white/10 rounded-full" />
                </div>

                <div className="space-y-4">
                  {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className="flex justify-between gap-4">
                      <div className="flex gap-4">
                        {[1, 2].map((col) => {
                          const id = `${deck === 'lower' ? 'L' : 'U'}-${rowIndex * cols + col}`;
                          const status = getSeatStatus(id);
                          return (
                            <button
                              key={id}
                              disabled={status === 'booked'}
                              onClick={() => handleSeatClick(id)}
                              className={`w-10 h-10 rounded-lg border transition-all duration-300 flex items-center justify-center ${
                                status === 'selected' ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' :
                                status === 'booked' ? 'bg-red-400/5 border-red-400/20 cursor-not-allowed grayscale' :
                                'bg-white/5 border-white/10 hover:border-white/30 hover:scale-105'
                              }`}
                            >
                              {status === 'selected' ? <Check size={12} className="text-black" /> : <div className="text-[8px] font-black text-[#555555] opacity-50">{id}</div>}
                            </button>
                          );
                        })}
                      </div>

                      <div className="w-8" />

                      <div className="flex gap-4">
                        {[3, 4].map((col) => {
                          const id = `${deck === 'lower' ? 'L' : 'U'}-${rowIndex * cols + col}`;
                          const status = getSeatStatus(id);
                          return (
                            <button
                              key={id}
                              disabled={status === 'booked'}
                              onClick={() => handleSeatClick(id)}
                              className={`w-10 h-10 rounded-lg border transition-all duration-300 flex items-center justify-center ${
                                status === 'selected' ? 'bg-white border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' :
                                status === 'booked' ? 'bg-red-400/5 border-red-400/20 cursor-not-allowed grayscale' :
                                'bg-white/5 border-white/10 hover:border-white/30 hover:scale-105'
                              }`}
                            >
                              {status === 'selected' ? <Check size={12} className="text-black" /> : <div className="text-[8px] font-black text-[#555555] opacity-50">{id}</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <PassengerDetailsForm 
              selectedSeats={selectedSeats}
              passengerDetails={passengerDetails}
              setPassengerDetails={setPassengerDetails}
            />
          )}
        </div>

        {/* Right: Booking Summary */}
        <div className="lg:w-1/3 p-10 flex flex-col bg-[#050505]">
          <div className="flex justify-between items-start mb-12">
            <h3 className="text-xl font-bold text-white tracking-tight">Summary</h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} className="text-[#555555]" />
            </button>
          </div>

          <div className="flex-1 space-y-8">
            <div>
              <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest mb-4 block italic">Selected Seats</label>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.length > 0 ? (
                  selectedSeats.map(seat => (
                    <motion.div 
                      layoutId={seat}
                      key={seat} 
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {seat}
                    </motion.div>
                  ))
                ) : (
                  <span className="text-sm font-medium text-[#333333]">Choose your seats on the left</span>
                )}
              </div>
            </div>

            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[24px] space-y-4">
              <div className="flex justify-between items-center text-sm font-bold text-[#A1A1A1]">
                <span>Base Fare</span>
                <span className="text-white">₹{selectedSeats.length * bus.price}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#A1A1A1]">
                <span>GST & Tolls</span>
                <span className="text-white">₹{selectedSeats.length * 45}</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm font-black text-white uppercase tracking-widest italic">Total Amount</span>
                <span className="text-2xl font-black text-white tracking-tighter italic">₹{selectedSeats.length * (bus.price + 45)}</span>
              </div>
            </div>

            {step === 1 && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-3 text-[11px] font-bold text-[#A1A1A1] uppercase tracking-wider mb-3">
                  <Shield size={14} className="text-blue-500" />
                  Free Cancellation
                </div>
                <p className="text-[10px] font-medium text-[#555555] leading-relaxed">
                  Full refund if cancelled 24 hours before journey. Smart-refund active.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0 || (step === 2 && !isFormValid())}
            className={`mt-10 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
              (selectedSeats.length > 0 && (step === 1 || isFormValid()))
              ? 'bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-2xl' 
              : 'bg-white/5 text-[#333333] cursor-not-allowed'
            }`}
          >
            {step === 1 ? 'Next: Passenger Details' : 'Proceed to Checkout'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SeatSelectionModal;
