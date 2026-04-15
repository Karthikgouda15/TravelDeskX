// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/PassengerDetailsForm.jsx
import React from 'react';
import { User, Calendar, Smile } from 'lucide-react';

const PassengerDetailsForm = ({ selectedSeats, passengerDetails, setPassengerDetails }) => {
  const handleChange = (seatId, field, value) => {
    setPassengerDetails(prev => ({
      ...prev,
      [seatId]: {
        ...prev[seatId],
        [field]: value,
        seatNumber: seatId
      }
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {selectedSeats.map((seatId) => (
        <div key={seatId} className="p-6 bg-white/[0.03] border border-white/5 rounded-[24px] space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Passenger - Seat {seatId}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] group-focus-within:text-white transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={passengerDetails[seatId]?.name || ''}
                  onChange={(e) => handleChange(seatId, 'name', e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 focus:border-white/20 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Age</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] group-focus-within:text-white transition-colors">
                  <Calendar size={16} />
                </div>
                <input
                  type="number"
                  placeholder="25"
                  value={passengerDetails[seatId]?.age || ''}
                  onChange={(e) => handleChange(seatId, 'age', e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 focus:border-white/20 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#555555] uppercase tracking-widest px-1">Gender</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555] group-focus-within:text-white transition-colors">
                  <Smile size={16} />
                </div>
                <select
                  value={passengerDetails[seatId]?.gender || ''}
                  onChange={(e) => handleChange(seatId, 'gender', e.target.value)}
                  className="w-full bg-[#050505] border border-white/5 focus:border-white/20 rounded-xl py-3 pl-12 pr-4 text-sm font-medium text-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassengerDetailsForm;
