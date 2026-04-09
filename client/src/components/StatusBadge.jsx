// src/components/StatusBadge.jsx
import React from 'react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status }) => {
  const getStyles = (s) => {
    switch (s?.toLowerCase()) {
      case 'confirmed':
      case 'available':
      case 'scheduled':
        return 'bg-white text-black border-transparent';
      case 'pending':
      case 'held':
      case 'delayed':
        return 'bg-white/10 text-white border-white/10';
      case 'cancelled':
      case 'booked':
      case 'maintenance':
        return 'bg-transparent text-[#444] border-[#1A1A1A]';
      default:
        return 'bg-transparent text-[#A1A1A1] border-[#1A1A1A]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-widest ${getStyles(status)}`}
    >
      {status}
    </motion.div>
  );
};

export default StatusBadge;
