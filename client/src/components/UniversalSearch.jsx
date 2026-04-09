// /Users/karthikgouda/Desktop/TravelDesk/client/src/components/UniversalSearch.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Hotel, Train, Bus, MapPin, Calendar, Users, Search, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'flight', label: 'Flights', icon: Plane },
  { id: 'hotel', label: 'Hotels', icon: Hotel },
  { id: 'train', label: 'Trains', icon: Train },
  { id: 'bus', label: 'Buses', icon: Bus },
];

const UniversalSearch = () => {
  const [activeTab, setActiveTab] = useState('flight');
  const [searchData, setSearchData] = useState({
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams(searchData).toString();
    navigate(`/${activeTab}s?${query}`);
  };

  const swapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
  };

  return (
    <div className="w-full">
      {/* Category Tabs: Apple Style */}
      <div className="flex gap-1 mb-6 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-[13px] font-medium transition-all relative
              ${activeTab === cat.id ? 'text-white' : 'text-[#A1A1A1] hover:text-white'}
            `}
          >
            {activeTab === cat.id && (
              <motion.div 
                layoutId="activeTabPill" 
                className="absolute inset-0 bg-white/10 rounded-full" 
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <cat.icon size={14} className={activeTab === cat.id ? 'text-white' : 'text-[#444]'} />
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search Container: Minimal Glass */}
      <div className="bg-white/[0.02] border border-[#1A1A1A] rounded-3xl p-8 transition-colors hover:border-[#333]">
        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          
          {/* Origin */}
          <div className="lg:col-span-3 space-y-3 relative">
            <label className="text-[11px] font-medium uppercase text-[#A1A1A1] tracking-widest ml-1">
              {activeTab === 'hotel' ? 'Location' : 'From'}
            </label>
            <input
              type="text"
              placeholder={activeTab === 'flight' ? 'New York' : 'Enter city'}
              className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-white focus:border-white transition-colors outline-none text-lg font-medium placeholder:text-[#333]"
              value={searchData.origin}
              onChange={(e) => setSearchData({...searchData, origin: e.target.value})}
              required
            />
            {activeTab !== 'hotel' && (
              <button 
                type="button"
                onClick={swapLocations}
                className="absolute right-[-25px] top-[60%] -translate-y-1/2 z-10 p-2 bg-black border border-[#1A1A1A] rounded-full hover:border-white transition-colors hidden lg:block"
              >
                <ArrowRightLeft size={12} className="text-[#A1A1A1]" />
              </button>
            )}
          </div>

          {/* Destination */}
          <AnimatePresence mode="wait">
            {activeTab !== 'hotel' && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="lg:col-span-3 space-y-3"
              >
                <label className="text-[11px] font-medium uppercase text-[#A1A1A1] tracking-widest ml-1">To</label>
                <input
                  type="text"
                  placeholder="San Francisco"
                  className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-white focus:border-white transition-colors outline-none text-lg font-medium placeholder:text-[#333]"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date */}
          <div className={`${activeTab === 'hotel' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-3`}>
            <label className="text-[11px] font-medium uppercase text-[#A1A1A1] tracking-widest ml-1">
              {activeTab === 'hotel' ? 'Stay Duration' : 'Departure Date'}
            </label>
            <input
              type="date"
              className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-white focus:border-white transition-colors outline-none text-lg font-medium appearance-none invert-[0.8] brightness-200"
              value={searchData.date}
              onChange={(e) => setSearchData({...searchData, date: e.target.value})}
              required
            />
          </div>

          {/* Passengers */}
          <div className="lg:col-span-2 space-y-3">
            <label className="text-[11px] font-medium uppercase text-[#A1A1A1] tracking-widest ml-1">
              {activeTab === 'hotel' ? 'Guests' : 'Passengers'}
            </label>
            <select
              className="w-full bg-transparent border-b border-[#1A1A1A] py-3 text-white focus:border-white transition-colors outline-none text-lg font-medium"
              value={searchData.passengers}
              onChange={(e) => setSearchData({...searchData, passengers: e.target.value})}
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n} className="bg-black">{n} {n===1 ? activeTab==='hotel'?'Guest':'Passenger' : activeTab==='hotel'?'Guests':'Passengers'}</option>)}
            </select>
          </div>

          {/* Search Button */}
          <div className="lg:col-span-1">
            <button type="submit" className="w-14 h-14 bg-white text-black flex items-center justify-center rounded-full hover:opacity-80 transition-opacity ml-auto active:scale-95 duration-200">
              <Search size={22} />
            </button>
          </div>
        </form>

        {/* Minimal Tags */}
        <div className="mt-10 pt-8 border-t border-[#1A1A1A] flex flex-wrap gap-6 items-center">
            <span className="text-[11px] font-medium uppercase text-[#444] tracking-widest">Offers:</span>
            {['Flexible Fare', 'Direct Only', 'Business Class'].map(tag => (
                <button key={tag} className="text-[11px] font-medium text-[#A1A1A1] hover:text-white transition-colors lowercase italic tracking-tight">
                    #{tag.replace(' ', '')}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UniversalSearch;
