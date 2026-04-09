import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getHotels, setFilters, setSelectedHotel } from '../features/hotelSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Star, Users, Briefcase, SlidersHorizontal, Image as ImageIcon, Map as MapIcon, List } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SkeletonCard from '../components/SkeletonCard';
import StatusBadge from '../components/StatusBadge';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to center map on results
const RecenterMap = ({ hotels }) => {
  const map = useMap();
  useEffect(() => {
    if (hotels.length > 0 && hotels[0].location?.coordinates) {
      const [lng, lat] = hotels[0].location.coordinates;
      map.setView([lat, lng], 12);
    }
  }, [hotels, map]);
  return null;
};

const Hotels = () => {
  const dispatch = useDispatch();
  const { results, isLoading, filters } = useSelector((state) => state.hotels);
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Sync URL params to Redux on mount
  useEffect(() => {
    const origin = searchParams.get('origin'); // Location in dashboard
    const date = searchParams.get('date');
    const guests = searchParams.get('passengers');

    if (origin || date || guests) {
      dispatch(setFilters({
        city: origin || '',
        checkIn: date || '',
        guests: Number(guests) || 1
      }));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    dispatch(getHotels(filters));
  }, [dispatch, filters.city]); // Re-fetch on city change

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(getHotels(filters));
  };

  const getAvailableRoomsCount = (hotel) => {
    // In a real app, this would be computed server-side or via socket updates stored in state
    return hotel.totalRooms > 5 ? hotel.totalRooms : 3; 
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Find Hotels | TravelDesk</title>
        <meta name="description" content="Book premium hotels and resorts worldwide with real-time availability." />
      </Helmet>

      {/* Hero Search Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="hero-header mb-16 p-10 relative group"
      >
        <div className="absolute inset-0 bg-animated-grid opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative z-10">
          <div className="mb-8 overflow-hidden">
             <motion.h2 
               initial={{ y: 50 }} 
               animate={{ y: 0 }}
               className="text-4xl font-heading font-black tracking-tight"
             >
               Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-400">Perfect Stay</span>
             </motion.h2>
             <p className="text-textMuted text-sm font-medium mt-2">Discover premium rooms and exclusive enterprise deals worldwide.</p>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-1">
              <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] ml-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={filters.city}
                  onChange={(e) => dispatch(setFilters({ city: e.target.value }))}
                  className="input-field pl-11 bg-white/5 border-white/10 hover:border-accent/40 focus:border-accent"
                />
                <MapPin className="absolute left-4 top-3.5 text-accent/50" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] ml-1">Check-In</label>
              <input
                type="date"
                value={filters.checkIn}
                onChange={(e) => dispatch(setFilters({ checkIn: e.target.value }))}
                className="input-field bg-white/5 border-white/10 hover:border-accent/40 focus:border-accent"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-accent tracking-[0.2em] ml-1">Check-Out</label>
              <input
                type="date"
                value={filters.checkOut}
                onChange={(e) => dispatch(setFilters({ checkOut: e.target.value }))}
                className="input-field bg-white/5 border-white/10 hover:border-accent/40 focus:border-accent"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full h-[52px] flex items-center justify-center gap-2 group/btn">
                <Search size={20} className="group-hover/btn:scale-110 transition-transform" />
                <span className="uppercase tracking-[0.1em] font-black">Search Hotels</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-72 space-y-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-bold uppercase tracking-widest text-sm">Filters</h3>
              <SlidersHorizontal size={18} className="text-accent" />
            </div>

            <div className="space-y-6">
              {/* Star Rating */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Star Rating</p>
                <div className="flex gap-2">
                  {[3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => dispatch(setFilters({ starRating: star }))}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        filters.starRating === star 
                        ? 'bg-accent/10 border-accent/50 text-accent' 
                        : 'bg-white/5 border-white/10 text-textMuted hover:border-white/20'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">Price / Night</p>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={filters.priceMax}
                  onChange={(e) => dispatch(setFilters({ priceMax: Number(e.target.value) }))}
                  className="w-full accent-accent bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs font-mono text-accent">
                   <span>$0</span>
                   <span>${filters.priceMax}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results Info and View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-textMuted font-bold uppercase tracking-widest">
            {isLoading ? 'Searching...' : `${results.length} Hotels Found in ${filters.city || 'all locations'}`}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border transition-all ${viewMode === 'grid' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
              title="Grid View"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl border transition-all ${viewMode === 'map' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
              title="Map View"
            >
              <MapIcon size={18} />
            </button>
          </div>
        </div>

        {/* Results List / Map Rendering */}
        <main className="flex-1">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <SkeletonCard count={4} />
              </div>
            ) : viewMode === 'map' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card h-[600px] overflow-hidden p-0 border border-white/10 relative"
              >
                <MapContainer center={[28.6139, 77.2167]} zoom={12} className="h-full w-full grayscale-[50%] brightness-[80%] contrast-[120%]">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  <RecenterMap hotels={results} />
                  {results.map(hotel => {
                    if (!hotel.location?.coordinates) return null;
                    const [lng, lat] = hotel.location.coordinates;
                    return (
                      <Marker key={hotel._id} position={[lat, lng]}>
                        <Popup className="custom-leaflet-popup">
                          <div className="p-2 min-w-[200px]">
                            <h4 className="font-bold text-accent mb-1">{hotel.name}</h4>
                            <p className="text-xs text-white/80 mb-2 truncate">{hotel.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-black text-secondary">$350/nt</span>
                              <button 
                                className="text-[10px] uppercase font-black tracking-widest text-accent hover:underline"
                                onClick={() => dispatch(setSelectedHotel(hotel))}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </motion.div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((hotel, index) => {
                  const roomsLeft = getAvailableRoomsCount(hotel);
                  return (
                    <motion.div
                      key={hotel._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card group overflow-hidden flex flex-col hover:border-accent/30 transition-all cursor-pointer"
                      onClick={() => dispatch(setSelectedHotel(hotel))}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-48 bg-white/5 border-b border-white/10 overflow-hidden">
                        {hotel.images && hotel.images.length > 0 ? (
                           <img 
                              src={hotel.images[0]} 
                              alt={hotel.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                           />
                        ) : (
                           <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                              <ImageIcon size={48} className="text-white/10" />
                           </div>
                        )}
                        <div className="absolute top-4 right-4">
                           <StatusBadge status={hotel.isActive ? 'Active' : 'Closed'} />
                        </div>
                        <div className="absolute bottom-4 left-4 flex gap-1">
                           {[...Array(hotel.starRating)].map((_, i) => (
                             <Star key={i} size={14} className="fill-accent text-accent" />
                           ))}
                        </div>
                      </div>

                      <div className="p-6 space-y-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className="text-xl font-heading font-black">{hotel.name}</h4>
                              <p className="text-xs text-textMuted flex items-center gap-1 font-bold">
                                 <MapPin size={12} className="text-accent" />
                                 {hotel.location.city}, {hotel.location.country}
                              </p>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                           {hotel.amenities.slice(0, 4).map(amn => (
                             <span key={amn} className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md text-textMuted">
                                {amn}
                             </span>
                           ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">Starts from</p>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-2xl font-mono font-black text-secondary">$350</span>
                                 <span className="text-[10px] text-textMuted uppercase">/ night</span>
                              </div>
                           </div>
                           <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter
                              ${roomsLeft < 5 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-accent/10 border-accent/20 text-accent'}
                           `}>
                              {roomsLeft} Rooms Left
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-12">
                 <div className="glass-card text-center py-20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full -top-1/2"></div>
                    <div className="relative z-10">
                       <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:border-accent/40 transition-all">
                          <Search size={32} className="text-accent" />
                       </div>
                       <h3 className="text-2xl font-heading font-black mb-2">Finding Something Special...</h3>
                       <p className="text-textMuted max-w-md mx-auto">We couldn't find exact matches for your search, but check out these highly-rated collections below.</p>
                    </div>
                 </div>

                 {/* Featured Stays (Fallback) */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                       <motion.div
                          key={`featured-${i}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="glass-card group overflow-hidden flex flex-col hover:border-accent/30 transition-all grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500"
                       >
                          <div className="relative h-48 bg-white/5 border-b border-white/10 overflow-hidden">
                             <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon size={48} className="text-white/10" />
                             </div>
                             <div className="absolute top-4 right-4">
                                <StatusBadge status="Recommended" />
                             </div>
                          </div>
                          <div className="p-6 space-y-4">
                             <div className="h-6 w-3/4 bg-white/5 rounded-md animate-pulse"></div>
                             <div className="h-4 w-1/2 bg-white/5 rounded-md animate-pulse"></div>
                             <div className="flex gap-2">
                                <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse"></div>
                                <div className="h-4 w-16 bg-white/5 rounded-md animate-pulse"></div>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Hotels;
