// src/pages/Hotels.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getHotels, getHotelById, setFilters, setSelectedHotel } from '../features/hotelSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Search, MapPin, Star, Users, SlidersHorizontal, Image as ImageIcon,
  Map as MapIcon, List, Calendar, ChevronDown, X, Wifi, Coffee,
  Car, Dumbbell, Waves, Utensils, Shield, BadgePercent, Sparkles,
  Building2, ChevronRight, Heart, Share2, ArrowRight, BedDouble,
  Bath, Wind, Tv, Phone, Globe, Percent, Award, Zap, Clock, Tag,
  Radio, ChevronLeft
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SkeletonCard from '../components/SkeletonCard';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Constants ───────────────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  { city: 'Mumbai', img: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', hotels: '2,400+', tag: 'Trending' },
  { city: 'New Delhi', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80', hotels: '3,100+', tag: 'Popular' },
  { city: 'Goa', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', hotels: '1,800+', tag: 'Beach' },
  { city: 'Bangalore', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80', hotels: '1,600+', tag: 'Business' },
  { city: 'Jaipur', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80', hotels: '1,200+', tag: 'Heritage' },
  { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80', hotels: '800+', tag: 'Luxury' },
];

const CITY_FILTERS = ['All', 'New Delhi', 'Mumbai', 'Bangalore', 'Goa', 'Jaipur', 'Hyderabad', 'Chennai'];

const AMENITY_ICONS = {
  'WiFi': Wifi, 'Pool': Waves, 'Gym': Dumbbell, 'Restaurant': Utensils,
  'Parking': Car, 'Spa': Sparkles, 'Bar': Coffee, 'Room Service': BedDouble,
  'AC': Wind, 'TV': Tv, 'Laundry': Bath, 'Concierge': Phone,
};

const USPS = [
  { icon: Shield, title: 'Secure Booking', desc: 'End-to-end encrypted transactions with instant confirmation', color: 'from-emerald-500/20 to-emerald-500/5' },
  { icon: BadgePercent, title: 'Best Price Guarantee', desc: 'We match any lower price you find — no questions asked', color: 'from-blue-500/20 to-blue-500/5' },
  { icon: Zap, title: 'Instant Confirmation', desc: 'Get your booking confirmed in under 10 seconds', color: 'from-amber-500/20 to-amber-500/5' },
  { icon: Clock, title: 'Free Cancellation', desc: 'Cancel up to 24h before check-in on select properties', color: 'from-purple-500/20 to-purple-500/5' },
];

// ─── Helper: Map Recenter ────────────────────────────────────────────────────
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

// ─── Guests / Rooms Picker ──────────────────────────────────────────────────
const GuestPicker = ({ rooms, adults, children, onUpdate, isOpen, onToggle }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onToggle]);

  const Counter = ({ label, value, onChange, min = 0, max = 10 }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-white/80 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold text-lg transition-colors disabled:opacity-30"
          disabled={value <= min}>−</button>
        <span className="font-mono font-black text-lg w-5 text-center">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold text-lg transition-colors disabled:opacity-30"
          disabled={value >= max}>+</button>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1 mb-1.5">
        <Users size={12} /> Guests & Rooms
      </label>
      <button
        type="button"
        onClick={() => onToggle(!isOpen)}
        className="input-field bg-white/5 border-white/10 w-full text-sm flex items-center justify-between h-[52px]"
      >
        <span>{rooms} Room{rooms > 1 ? 's' : ''} · {adults + children} Guest{(adults + children) > 1 ? 's' : ''}</span>
        <ChevronDown size={14} className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="absolute top-full mt-2 w-64 bg-[#111] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 space-y-1"
          >
            <Counter label="Rooms" value={rooms} onChange={(v) => onUpdate({ rooms: v })} min={1} max={5} />
            <Counter label="Adults" value={adults} onChange={(v) => onUpdate({ adults: v })} min={1} max={9} />
            <Counter label="Children" value={children} onChange={(v) => onUpdate({ children: v })} min={0} max={4} />
            <div className="pt-3 border-t border-white/8">
              <button
                type="button"
                onClick={() => onToggle(false)}
                className="w-full py-2 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Hotel Detail Drawer ─────────────────────────────────────────────────────
const HotelDetailDrawer = ({ hotel, onClose }) => {
  if (!hotel) return null;
  const price = 350 + Math.floor(Math.random() * 200);
  const rating = (7 + Math.random() * 2.5).toFixed(1);
  const reviews = Math.floor(200 + Math.random() * 800);

  return (
    <AnimatePresence>
      {hotel && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-[#0A0A0A] border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header Image*/}
            <div className="relative h-72 bg-white/5 overflow-hidden">
              {hotel.images && hotel.images.length > 0 ? (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                  <Building2 size={80} className="text-white/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors">
                <X size={18} className="text-white" />
              </button>
              {/* Quick Actions */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors">
                  <Heart size={16} className="text-white" />
                </button>
                <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-colors">
                  <Share2 size={16} className="text-white" />
                </button>
              </div>
              {/* Rating Badge */}
              <div className="absolute bottom-4 right-4 bg-white text-black px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="font-black text-lg">{rating}</span>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none">{Number(rating) >= 9 ? 'Exceptional' : Number(rating) >= 8 ? 'Excellent' : 'Very Good'}</p>
                  <p className="text-[9px] text-black/60 font-medium">{reviews} reviews</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(hotel.starRating || 4)].map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider ml-1">{hotel.starRating}-Star Hotel</span>
                </div>
                <h2 className="text-2xl font-sans font-bold tracking-tight text-white">{hotel.name}</h2>
                <p className="text-sm text-white/50 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin size={13} className="text-white/40" />
                  {hotel.location?.city}, {hotel.location?.country}
                </p>
              </div>

              {/* Price Card */}
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Starting from</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-mono font-black text-white">${price}</span>
                      <span className="text-sm text-white/40 font-medium">/ night</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                      <Tag size={10} /> Includes taxes & fees
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-white/30 line-through font-mono">${price + 120}</p>
                    <span className="inline-block bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Save ${120}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">About</h3>
                <p className="text-sm text-white/50 leading-relaxed">{hotel.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(hotel.amenities || []).map(amenity => {
                    const Icon = AMENITY_ICONS[amenity] || Sparkles;
                    return (
                      <div key={amenity} className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5">
                        <Icon size={14} className="text-white/40 shrink-0" />
                        <span className="text-xs text-white/70 font-medium">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Room Info */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">Availability</h3>
                <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <BedDouble size={18} className="text-white/40" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{hotel.totalRooms} Total Rooms</p>
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Multiple room types available</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    hotel.totalRooms <= 5 
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20' 
                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {hotel.totalRooms <= 5 ? 'Few Left' : 'Available'}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button className="w-full bg-white text-black font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Book Now — ${price}/night
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Hotel Card (ixigo-inspired) ─────────────────────────────────────────────
const HotelCard = ({ hotel, index, onSelect }) => {
  const price = 350 + (index * 47) % 300;
  const originalPrice = price + 80 + (index * 23) % 100;
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const rating = (7.5 + (index * 0.3) % 2).toFixed(1);
  const reviews = 150 + (index * 73) % 600;
  const roomsLeft = hotel.totalRooms > 5 ? hotel.totalRooms : 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="group glass-card overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-500 relative"
      onClick={() => onSelect(hotel)}
    >
      {/* Image Section */}
      <div className="relative h-52 bg-white/5 overflow-hidden">
        {hotel.images && hotel.images.length > 0 ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/[0.03] to-white/[0.08]">
            <Building2 size={56} className="text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-emerald-500/90 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
            {discount}% Off
          </span>
          {index < 3 && (
            <span className="bg-white/90 text-black px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
              Best Price
            </span>
          )}
        </div>

        {/* Star Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1">
          {[...Array(hotel.starRating || 4)].map((_, i) => (
            <Star key={i} size={12} className="fill-amber-400 text-amber-400 drop-shadow-sm" />
          ))}
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-white text-black px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
          <span className="font-black text-sm">{rating}</span>
          <div className="text-left hidden sm:block">
            <p className="text-[8px] font-black uppercase leading-none">{Number(rating) >= 9 ? 'Exceptional' : Number(rating) >= 8 ? 'Excellent' : 'Very Good'}</p>
            <p className="text-[8px] text-black/50 font-medium">{reviews} reviews</p>
          </div>
        </div>

        {/* Favorite */}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Heart size={14} className="text-white" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-sans font-bold tracking-tight text-white group-hover:text-white/90 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5 font-medium">
            <MapPin size={11} className="text-white/30" />
            {hotel.location?.city}, {hotel.location?.country}
          </p>
        </div>

        {/* Amenity Tags */}
        <div className="flex flex-wrap gap-1.5">
          {(hotel.amenities || []).slice(0, 4).map(amn => {
            const Icon = AMENITY_ICONS[amn] || Sparkles;
            return (
              <span key={amn} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/[0.04] border border-white/5 rounded-md text-white/40">
                <Icon size={9} />
                {amn}
              </span>
            );
          })}
        </div>

        {/* Price Section */}
        <div className="pt-3 border-t border-white/5 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 line-through font-mono">${originalPrice}</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase">Save ${originalPrice - price}</span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-mono font-black text-white">${price}</span>
              <span className="text-[10px] text-white/30 uppercase font-medium">/ night</span>
            </div>
            <p className="text-[9px] text-white/25 font-medium mt-0.5">+ taxes & fees</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
            roomsLeft < 5
              ? 'bg-red-500/10 border border-red-500/15 text-red-400'
              : 'bg-white/5 border border-white/8 text-white/50'
          }`}>
            {roomsLeft < 5 ? `Only ${roomsLeft} left!` : `${roomsLeft} Rooms`}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Skeleton Hotel Card ─────────────────────────────────────────────────────
const HotelSkeletonCard = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="glass-card overflow-hidden animate-pulse">
        <div className="h-52 bg-white/5" />
        <div className="p-5 space-y-4">
          <div className="h-5 bg-white/5 rounded-lg w-3/4" />
          <div className="h-3 bg-white/5 rounded-lg w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 w-14 bg-white/5 rounded-md" />
            <div className="h-5 w-14 bg-white/5 rounded-md" />
            <div className="h-5 w-14 bg-white/5 rounded-md" />
          </div>
          <div className="pt-3 border-t border-white/5 flex justify-between">
            <div className="h-7 w-20 bg-white/5 rounded-lg" />
            <div className="h-7 w-24 bg-white/5 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main Hotels Component ──────────────────────────────────────────────────
const Hotels = () => {
  const dispatch = useDispatch();
  const { results, isLoading, filters, selectedHotel } = useSelector((state) => state.hotels);
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [guestConfig, setGuestConfig] = useState({ rooms: 1, adults: 2, children: 0 });
  const [activeCity, setActiveCity] = useState('All');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const destinationsRef = useRef(null);

  // Sync URL params to Redux on mount
  useEffect(() => {
    const origin = searchParams.get('origin');
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
    // Strip empty values so the backend doesn't filter on empty strings
    const cleanParams = {};
    if (filters.city) cleanParams.city = filters.city;
    if (filters.starRating) cleanParams.starRating = filters.starRating;
    if (filters.priceMax && filters.priceMax < 1000) cleanParams.priceMax = filters.priceMax;
    if (filters.amenities?.length) cleanParams.amenities = filters.amenities.join(',');
    dispatch(getHotels(cleanParams));
  }, [dispatch, filters.city, filters.starRating, filters.priceMax, JSON.stringify(filters.amenities)]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanParams = {};
    if (filters.city) cleanParams.city = filters.city;
    if (filters.checkIn) cleanParams.checkIn = filters.checkIn;
    if (filters.checkOut) cleanParams.checkOut = filters.checkOut;
    if (filters.starRating) cleanParams.starRating = filters.starRating;
    if (filters.priceMax && filters.priceMax < 1000) cleanParams.priceMax = filters.priceMax;
    cleanParams.guests = guestConfig.adults + guestConfig.children;
    dispatch(getHotels(cleanParams));
  };

  const handleCityClick = (city) => {
    setActiveCity(city);
    if (city === 'All') {
      dispatch(setFilters({ city: '' }));
    } else {
      dispatch(setFilters({ city }));
    }
  };

  const handleDestinationClick = (city) => {
    dispatch(setFilters({ city }));
    setActiveCity(city);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live ticker messages
  const tickerMessages = [
    '🏨 423 hotels booked in New Delhi today',
    '🔥 Goa hotels selling fast — 67% booked this weekend',
    '💰 Save up to 45% on Mumbai luxury stays',
    '⚡ TravelDesk Assured offers free cancellation on select properties',
    '🔐 Your booking is protected with bank-grade encryption',
    '🌟 Over 10,000 verified reviews added this month',
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Find Hotels | TravelDesk Pro</title>
        <meta name="description" content="Book premium hotels and resorts worldwide with real-time availability and best price guarantee." />
      </Helmet>

      {/* ── Live Ticker ──────────────────────────────────────────────── */}
      <div className="w-full overflow-hidden bg-white/[0.02] border-b border-white/5 py-1.5 flex items-center whitespace-nowrap hidden md:flex">
        <div className="flex items-center gap-2 px-4 z-10 bg-black/80 pr-4 border-r border-white/10 shrink-0">
          <Radio size={10} className="text-white fill-white animate-pulse" />
          <span className="text-[9px] font-black uppercase text-white tracking-[0.2em]">Live</span>
        </div>
        <motion.div
          initial={{ x: '0%' }}
          animate={{ x: '-100%' }}
          transition={{ ease: 'linear', duration: 35, repeat: Infinity }}
          className="flex items-center flex-nowrap"
        >
          {[...tickerMessages, ...tickerMessages].map((msg, i) => (
            <span key={i} className="text-[10px] font-bold text-white/30 uppercase tracking-widest mx-10 inline-block">
              {msg}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Hero Search Section ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card border border-white/10 p-8 pt-10 mb-12 relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div>
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-sans font-bold tracking-tight silver-text"
              >
                Find Your Perfect Stay.
              </motion.h1>
              <p className="text-white/40 text-sm mt-1.5 font-medium">
                Premium hotels · Real-time availability · Best price guaranteed
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Location */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1">
                    <MapPin size={12} /> Destination
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Where are you going?"
                      value={filters.city}
                      onChange={(e) => dispatch(setFilters({ city: e.target.value }))}
                      className="input-field bg-white/5 border-white/10 w-full pl-10 h-[52px]"
                    />
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" size={16} />
                  </div>
                </div>

                {/* Check-In */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1">
                    <Calendar size={12} /> Check-In
                  </label>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => dispatch(setFilters({ checkIn: e.target.value }))}
                    className="input-field bg-white/5 border-white/10 w-full h-[52px]"
                  />
                </div>

                {/* Check-Out */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-white/50 tracking-[0.2em] flex items-center gap-1.5 ml-1">
                    <Calendar size={12} /> Check-Out
                  </label>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => dispatch(setFilters({ checkOut: e.target.value }))}
                    className="input-field bg-white/5 border-white/10 w-full h-[52px]"
                  />
                </div>

                {/* Guests & Rooms */}
                <div className="md:col-span-3">
                  <GuestPicker
                    rooms={guestConfig.rooms}
                    adults={guestConfig.adults}
                    children={guestConfig.children}
                    onUpdate={(update) => setGuestConfig(prev => ({ ...prev, ...update }))}
                    isOpen={showGuestPicker}
                    onToggle={setShowGuestPicker}
                  />
                </div>

                {/* Search Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-white text-black hover:bg-gray-200 h-[52px] rounded-xl flex items-center justify-center gap-2.5 group/btn transition-all font-black uppercase tracking-[0.15em] text-xs shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <Search size={16} className="group-hover/btn:scale-110 transition-transform" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── City Filter Pills ──────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CITY_FILTERS.map(city => (
            <button
              key={city}
              onClick={() => handleCityClick(city)}
              className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300
                ${activeCity === city
                  ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/25 hover:text-white'
                }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* ── Results Header & View Toggle ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/50 font-bold uppercase tracking-widest">
              {isLoading ? 'Searching...' : `${results.length} Hotels Found`}
            </p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black uppercase text-white/60">Live Prices</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/8 rounded-xl p-1">
              {[
                { id: 'grid', icon: List, label: 'Grid' },
                { id: 'map', icon: MapIcon, label: 'Map' },
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all
                    ${viewMode === v.id
                      ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                      : 'text-white/40 hover:text-white'
                    }`}
                >
                  <v.icon size={12} />
                  {v.label}
                </button>
              ))}
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1.5 px-3 py-2 border border-white/10 rounded-xl text-[10px] font-black uppercase text-white/50 hover:border-white/25 hover:text-white transition-all lg:hidden"
            >
              <SlidersHorizontal size={12} /> Filters
            </button>
          </div>
        </div>

        {/* ── Main Content Area ──────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className={`lg:w-72 lg:shrink-0 space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="glass-card p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-bold text-sm uppercase tracking-widest">Filters</h3>
                <SlidersHorizontal size={16} className="text-white/40" />
              </div>

              <div className="space-y-6">
                {/* Star Rating */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Star Rating</p>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => dispatch(setFilters({ starRating: filters.starRating === star ? null : star }))}
                        className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          filters.starRating === star
                            ? 'bg-white/10 border-white/30 text-white'
                            : 'bg-white/[0.03] border-white/8 text-white/40 hover:border-white/15'
                        }`}
                      >
                        {star}<Star size={10} className={filters.starRating === star ? 'fill-amber-400 text-amber-400' : ''} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Price / Night</p>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceMax}
                    onChange={(e) => dispatch(setFilters({ priceMax: Number(e.target.value) }))}
                    className="w-full h-1 rounded-full appearance-none bg-white/10 cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-xs font-mono text-white/50">
                    <span>$0</span>
                    <span className="text-white font-bold">${filters.priceMax}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Popular Amenities</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['WiFi', 'Pool', 'Gym', 'Restaurant', 'Parking', 'Spa'].map(amenity => {
                      const Icon = AMENITY_ICONS[amenity] || Sparkles;
                      const isActive = (filters.amenities || []).includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => {
                            const current = filters.amenities || [];
                            const updated = isActive ? current.filter(a => a !== amenity) : [...current, amenity];
                            dispatch(setFilters({ amenities: updated }));
                          }}
                          className={`flex items-center gap-1.5 py-2 px-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            isActive
                              ? 'bg-white/10 border-white/25 text-white'
                              : 'bg-white/[0.02] border-white/5 text-white/35 hover:border-white/15'
                          }`}
                        >
                          <Icon size={11} />
                          {amenity}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Property Type</p>
                  <div className="space-y-1.5">
                    {['Hotel', 'Resort', 'Boutique', 'Villa'].map(type => (
                      <button
                        key={type}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid / Map */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <HotelSkeletonCard count={4} />
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
                            <div className="p-2 min-w-[220px]">
                              <h4 className="font-bold text-white mb-1">{hotel.name}</h4>
                              <p className="text-xs text-white/60 mb-2 truncate">{hotel.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-white">$350/nt</span>
                                <button
                                  className="text-[10px] uppercase font-black tracking-widest text-white hover:underline"
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
                  {results.map((hotel, index) => (
                    <HotelCard
                      key={hotel._id}
                      hotel={hotel}
                      index={index}
                      onSelect={(h) => dispatch(setSelectedHotel(h))}
                    />
                  ))}
                </div>
              ) : (
                /* Empty State + Discover Section */
                <div className="space-y-16">
                  {/* Empty Search Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card text-center py-16 border-dashed border-white/10 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <Search size={28} className="text-white/30" />
                      </div>
                      <h3 className="text-2xl font-sans font-bold tracking-tight mb-2 silver-text">Discover Amazing Stays</h3>
                      <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
                        Search for your destination above, or explore our handpicked collections below.
                      </p>
                    </div>
                  </motion.div>

                  {/* ── Popular Destinations ─────────────────────────────── */}
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-sans font-bold tracking-tight text-white">Popular Destinations</h2>
                        <p className="text-sm text-white/30 mt-1 font-medium">Handpicked cities for your next getaway</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => destinationsRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:border-white/25 transition-colors"
                        >
                          <ChevronLeft size={16} className="text-white/50" />
                        </button>
                        <button 
                          onClick={() => destinationsRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                          className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:border-white/25 transition-colors"
                        >
                          <ChevronRight size={16} className="text-white/50" />
                        </button>
                      </div>
                    </div>
                    <div ref={destinationsRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                      {POPULAR_DESTINATIONS.map((dest, i) => (
                        <motion.div
                          key={dest.city}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          whileHover={{ y: -4 }}
                          className="relative h-56 min-w-[240px] rounded-2xl overflow-hidden cursor-pointer group snap-start flex-shrink-0"
                          onClick={() => handleDestinationClick(dest.city)}
                        >
                          <img src={dest.img} alt={dest.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                              {dest.tag}
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="font-sans font-bold text-lg text-white tracking-tight">{dest.city}</h3>
                            <p className="text-[11px] text-white/50 font-medium">{dest.hotels} Hotels</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* ── Why Book with TravelDesk ─────────────────────────── */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-sans font-bold tracking-tight text-white">Why Book with TravelDesk?</h2>
                      <p className="text-sm text-white/30 mt-1 font-medium">Enterprise-grade booking infrastructure for every traveler</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {USPS.map((usp, i) => (
                        <motion.div
                          key={usp.title}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="glass-card p-5 relative overflow-hidden group hover:border-white/15 transition-all"
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${usp.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                          <div className="relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:border-white/20 transition-colors">
                              <usp.icon size={18} className="text-white/50 group-hover:text-white/80 transition-colors" />
                            </div>
                            <h3 className="font-sans font-bold text-sm text-white mb-1">{usp.title}</h3>
                            <p className="text-xs text-white/35 leading-relaxed">{usp.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* ── Exclusive Offers Banner ──────────────────────────── */}
                  <section>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative overflow-hidden rounded-3xl border border-white/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent" />
                      <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-white text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                              Limited Time
                            </span>
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                              Ends in 48h
                            </span>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-white mb-2">
                            Up to 50% Off<br />On Premium Stays
                          </h2>
                          <p className="text-white/40 text-sm mb-6 leading-relaxed max-w-md">
                            Book luxury 5-star hotels across India at never-before prices. Use code <span className="text-white font-bold">TDPRO50</span> at checkout.
                          </p>
                          <button className="bg-white text-black font-black py-3 px-8 rounded-full text-xs uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                            Explore Deals →
                          </button>
                        </div>
                        <div className="w-40 h-40 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center">
                          <div className="text-center">
                            <Percent size={40} className="text-white/20 mx-auto mb-2" />
                            <p className="text-4xl font-mono font-black text-white">50</p>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">% OFF</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* ── Trending Now ──────────────────────────────────────── */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-sans font-bold tracking-tight text-white">Trending Now</h2>
                      <p className="text-sm text-white/30 mt-1 font-medium">Most booked properties this week</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: 'The Oberoi', city: 'Mumbai', price: '$420', star: 5, badge: '#1 Most Booked' },
                        { name: 'ITC Grand Chola', city: 'Chennai', price: '$380', star: 5, badge: 'Top Rated' },
                        { name: 'Taj Palace', city: 'New Delhi', price: '$450', star: 5, badge: 'Premium Pick' },
                      ].map((hotel, i) => (
                        <motion.div
                          key={hotel.name}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          whileHover={{ y: -2 }}
                          className="glass-card p-5 cursor-pointer hover:border-white/15 transition-all group relative overflow-hidden"
                          onClick={() => dispatch(setFilters({ city: hotel.city }))}
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Building2 size={48} />
                          </div>
                          <div className="relative z-10">
                            <span className="inline-block bg-white/10 text-white/60 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider mb-3">
                              {hotel.badge}
                            </span>
                            <div className="flex gap-0.5 mb-2">
                              {[...Array(hotel.star)].map((_, j) => (
                                <Star key={j} size={10} className="fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <h3 className="font-sans font-bold text-base text-white mb-0.5">{hotel.name}</h3>
                            <p className="text-[11px] text-white/40 font-medium flex items-center gap-1">
                              <MapPin size={10} /> {hotel.city}
                            </p>
                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-end">
                              <div>
                                <p className="text-[10px] text-white/30 font-medium">From</p>
                                <p className="text-xl font-mono font-black text-white">{hotel.price}</p>
                              </div>
                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest group-hover:text-white transition-colors flex items-center gap-1">
                                View <ArrowRight size={10} />
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Hotel Detail Drawer ──────────────────────────────────────── */}
      <HotelDetailDrawer
        hotel={selectedHotel}
        onClose={() => dispatch(setSelectedHotel(null))}
      />
    </div>
  );
};

export default Hotels;
