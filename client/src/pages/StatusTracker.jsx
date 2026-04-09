// /Users/karthikgouda/Desktop/TravelDesk/client/src/pages/StatusTracker.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Train, Plane, MapPin, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

const StatusTracker = () => {
    const [trackType, setTrackType] = useState('train');
    const [reference, setReference] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStatusData(null);
        
        try {
            const response = await axios.get(`/api/transport/track?type=${trackType}&reference=${reference}`);
            setStatusData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to track. Please check the reference number.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-20">
            <Helmet>
                <title>Status Tracker | TravelDesk</title>
            </Helmet>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-heading font-black text-white mb-4 uppercase tracking-tighter">
                    Live <span className="text-accent underline decoration-accent/30 decoration-8 underline-offset-8">Travel Intelligence</span>
                </h1>
                <p className="text-textMuted text-sm font-medium">Track your PNR or Flight Status in real-time with enterprise accuracy.</p>
            </motion.div>

            <div className="glass-card !p-0 overflow-hidden mb-12 border-white/5 bg-white/[0.02]">
                <div className="flex border-b border-white/5">
                    <button 
                        onClick={() => setTrackType('train')}
                        className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all ${trackType === 'train' ? 'bg-white/5 border-b-2 border-accent' : 'text-textMuted hover:text-white'}`}
                    >
                        <Train size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">PNR Status</span>
                    </button>
                    <button 
                        onClick={() => setTrackType('flight')}
                        className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all ${trackType === 'flight' ? 'bg-white/5 border-b-2 border-accent' : 'text-textMuted hover:text-white'}`}
                    >
                        <Plane size={24} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flight Status</span>
                    </button>
                </div>

                <div className="p-10">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input 
                                type="text"
                                placeholder={trackType === 'train' ? 'Enter 10-digit PNR Number' : 'Enter Flight Number (e.g. AI101)'}
                                className="input-field w-full pl-6"
                                value={reference}
                                onChange={(e) => setReference(e.target.value.toUpperCase())}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-primary min-w-[200px] flex items-center justify-center gap-3 px-8 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Search size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Check Status</span>
                                </>
                            )}
                        </button>
                    </form>
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                            <AlertCircle size={14} /> {error}
                        </motion.p>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {statusData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-card !p-8 border-accent/20 bg-accent/[0.02]"
                    >
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-lg">
                                        <span className="text-xl font-mono font-black text-accent">{statusData.reference}</span>
                                    </div>
                                    <StatusBadge status="Confirmed" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-heading font-black text-white">{trackType === 'train' ? statusData.details?.trainName || 'Rajdhani Express' : 'Air India AI-101'}</h3>
                                    <p className="text-[10px] font-black uppercase text-textMuted tracking-[0.2em]">{trackType === 'train' ? 'Indian Railways' : 'Indira Gandhi Intl - Chhatrapati Shivaji Intl'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 md:text-right">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-1 flex items-center justify-end gap-2">
                                        <Calendar size={12} /> Travel Date
                                    </p>
                                    <p className="text-sm font-bold text-white">15 June, 2026</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-1 flex items-center justify-end gap-2">
                                        <MapPin size={12} /> {trackType === 'train' ? 'Platform' : 'Gate'}
                                    </p>
                                    <p className="text-sm font-bold text-white">{statusData.details?.platform || 'PF 5'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-1">Coach / Class</p>
                                <p className="text-lg font-mono font-black text-white">{statusData.details?.fareClass || '3A'}</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                <p className="text-[10px] font-black uppercase text-textMuted tracking-widest mb-1">Seat Number</p>
                                <p className="text-lg font-mono font-black text-white">{statusData.details?.seat || 'S1, 45'}</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
                                <p className="text-[10px] font-black uppercase text-accent tracking-widest mb-1 flex items-center justify-center gap-1">
                                    <CheckCircle2 size={12} /> Status
                                </p>
                                <p className="text-lg font-black text-white uppercase tracking-tighter">{statusData.status}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatusBadge = ({ status }) => (
    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-[10px] font-black uppercase text-green-400 tracking-tighter">{status}</span>
    </div>
);

export default StatusTracker;
