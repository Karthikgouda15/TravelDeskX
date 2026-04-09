// src/pages/Checkout.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setStep, updatePassengerInfo, createFlightBooking, createHotelBooking, createTrainBooking, createBusBooking, clearCheckout } from '../features/bookingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, User, Users, CheckCircle2, ArrowRight, Plane, Hotel, Train, Bus, CreditCard, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { checkout, isLoading, error } = useSelector((state) => state.bookings);
  const { currentStep, flight, hotel, train, bus, item, type, selectedSeats, selectedRoom, classType, passengerInfo, totalPrice, bookingResponse } = checkout;

  const handleNextStep = () => {
     if (currentStep === 1) dispatch(setStep(2));
     else if (currentStep === 2) {
        if (type === 'flight') {
           dispatch(createFlightBooking({ flightId: item._id, seatNumbers: selectedSeats }));
        } else if (type === 'hotel') {
           dispatch(createHotelBooking({ hotelId: item._id, roomId: selectedRoom._id, checkIn: '2026-06-01', checkOut: '2026-06-05' }));
        } else if (type === 'train') {
           dispatch(createTrainBooking({ trainId: item._id, classType, passengers: 1 }));
        } else if (type === 'bus') {
           dispatch(createBusBooking({ busId: item._id, seatCount: 1 }));
        }
     }
  };

  const steps = [
    { id: 1, name: 'Review Selection', icon: type === 'flight' ? Plane : type === 'hotel' ? Hotel : type === 'train' ? Train : Bus },
    { id: 2, name: 'Passenger Details', icon: User },
    { id: 3, name: 'Confirmation', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>Checkout | TravelDesk</title>
      </Helmet>

      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-16 relative">
         <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10"></div>
         {steps.map((step) => (
           <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                 ${currentStep >= step.id ? 'bg-accent border-accent text-background shadow-[0_0_20px_rgba(0,212,200,0.4)]' : 'bg-background border-white/10 text-textMuted'}
              `}>
                <step.icon size={20} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep >= step.id ? 'text-accent' : 'text-textMuted'}`}>
                 {step.name}
              </span>
           </div>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="glass-card">
              <h3 className="text-xl font-heading font-black mb-8 p-2 border-b border-white/5 uppercase tracking-widest text-[12px] text-accent">Booking Summary</h3>
              {item && (
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                   <div className={`w-20 h-20 rounded-2xl flex items-center justify-center
                      ${type === 'flight' ? 'bg-accent/10 text-accent' : type === 'train' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}
                   `}>
                      {type === 'flight' && <Plane size={40} />}
                      {type === 'hotel' && <Hotel size={40} />}
                      {type === 'train' && <Train size={40} />}
                      {type === 'bus' && <Bus size={40} />}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="font-heading font-black text-2xl tracking-tighter">
                          {type === 'flight' ? item.airline : type === 'hotel' ? item.name : type === 'train' ? item.name : item.operatorName}
                      </h4>
                      <p className="text-sm text-textMuted font-bold uppercase tracking-widest mt-1">
                         {type === 'flight' && `${item.origin} → ${item.destination} • ${item.flightNumber}`}
                         {type === 'hotel' && `${item.city} • ${selectedRoom?.type || 'Luxury Suite'}`}
                         {type === 'train' && `Train #${item.trainNumber} • ${classType} Class`}
                         {type === 'bus' && `Operator: ${item.busType} • ${item.origin?.city} to ${item.destination?.city}`}
                      </p>
                   </div>
                   <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-8">
                      <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-1">Total Amount</p>
                      <p className="text-4xl font-mono font-black text-white">
                          <span className="text-sm font-sans mr-1 text-textMuted">₹</span>
                          {totalPrice.toLocaleString()}
                      </p>
                   </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-6">
               <button className="btn-outline px-12" onClick={() => navigate(-1)}>Go Back</button>
               <button className="btn-primary px-12 flex items-center gap-2" onClick={handleNextStep}>
                  Next Step <ChevronRight size={18} />
               </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="glass-card">
               <h3 className="text-xl font-heading font-black mb-8 p-2 border-b border-white/5">Passenger Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Full Legal Name</label>
                     <input
                        type="text"
                        placeholder="As shown on passport"
                        className="input-field"
                        value={passengerInfo.name}
                        onChange={(e) => dispatch(updatePassengerInfo({ name: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Email Address</label>
                     <input
                        type="email"
                        placeholder="travel@enterprise.com"
                        className="input-field"
                        value={passengerInfo.email}
                        onChange={(e) => dispatch(updatePassengerInfo({ email: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Passport Number</label>
                     <input
                        type="text"
                        placeholder="G1234567"
                        className="input-field"
                        value={passengerInfo.passportNumber}
                        onChange={(e) => dispatch(updatePassengerInfo({ passportNumber: e.target.value }))}
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Phone Number</label>
                     <input
                        type="tel"
                        placeholder="+1 (212) 555-0123"
                        className="input-field"
                        value={passengerInfo.phone}
                        onChange={(e) => dispatch(updatePassengerInfo({ phone: e.target.value }))}
                     />
                  </div>
               </div>
            </div>

            <div className="flex justify-end gap-6">
               <button className="btn-outline px-12" onClick={() => dispatch(setStep(1))}>Back</button>
               <button 
                  className="btn-primary px-12 flex items-center gap-2" 
                  onClick={handleNextStep}
                  disabled={isLoading}
               >
                  {isLoading ? 'Processing...' : 'Confirm Booking'} <ArrowRight size={18} />
               </button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-8 text-center py-12"
          >
            <div className="w-24 h-24 bg-accent/10 border border-accent/20 rounded-3xl flex items-center justify-center">
               <CheckCircle2 size={64} className="text-accent" />
            </div>
            <div>
               <h2 className="text-4xl font-heading font-black tracking-widest mb-2 uppercase">Booking Success!</h2>
               <p className="text-textMuted max-w-sm mx-auto font-bold uppercase tracking-widest text-xs">
                  Your trip is confirmed. Check your email for itinerary details and flight tickets.
               </p>
            </div>
            <div className="glass-card max-w-sm w-full p-4 border-accent/30 bg-accent/5">
                <p className="text-[10px] uppercase font-black text-accent tracking-[0.2em]">Reference ID</p>
                <p className="text-xl font-mono font-black text-white">TD-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
            <div className="flex gap-4">
               <button className="btn-outline" onClick={() => { dispatch(clearCheckout()); navigate('/my-bookings'); }}>
                  View My Bookings
               </button>
               <button className="btn-primary" onClick={() => { dispatch(clearCheckout()); navigate('/flights'); }}>
                  Find More
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
