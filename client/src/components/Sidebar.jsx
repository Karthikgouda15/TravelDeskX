// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PieChart, Hotel, PlaneTakeoff, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const adminLinks = [
    { name: 'Overview', path: '/admin/analytics', icon: LayoutDashboard },
    { name: 'Revenue', path: '/admin/analytics?tab=revenue', icon: BarChart3 },
    { name: 'Occupancy', path: '/admin/analytics?tab=occupancy', icon: Hotel },
    { name: 'Flights', path: '/admin/analytics?tab=flights', icon: PlaneTakeoff },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="sticky top-20 h-[calc(100vh-5rem)] w-64 glass border-r-0 rounded-none rounded-tr-3xl hidden lg:block">
      <div className="flex flex-col h-full py-8">
        <div className="px-6 mb-8">
          <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Management Console</p>
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-accent/10 border border-accent/20 text-accent' 
                  : 'text-textMuted hover:bg-white/5 hover:text-white border border-transparent'
                }`
              }
            >
              <link.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-sm tracking-widest uppercase">{link.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="px-6 mt-auto">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="text-[10px] font-black text-accent uppercase tracking-widest">System Active</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
