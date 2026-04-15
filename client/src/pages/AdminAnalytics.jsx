// src/pages/AdminAnalytics.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAnalytics, setDays } from '../features/analyticsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { BarChart as BarChartIcon, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Hotel, Globe, Calendar, Filter, RefreshCw, BarChart as LucideBarChart, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';

// Safe Icon wrapper to prevent crashes if an icon is missing from the library
const SafeIcon = ({ icon: Icon, ...props }) => {
  if (!Icon) return <Search {...props} />;
  return <Icon {...props} />;
};

const COLORS = ['#00D4C8', '#FF6B35', '#A855F7', '#3B82F6', '#EAB308'];

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const { data, days, isLoading } = useSelector((state) => state.analytics);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    dispatch(fetchAnalytics(days));
  }, [dispatch, days]);

  const kpis = [
    { title: 'Total Bookings', value: data?.bookings?.reduce((acc, curr) => acc + curr.count, 0) || 0, icon: TrendingUp, color: 'text-accent' },
    { title: 'Total Revenue', value: `₹${(data?.revenue?.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 0).toLocaleString()}`, icon: DollarSign, color: 'text-secondary' },
    { title: 'Active Users', value: '1,284', icon: Users, color: 'text-blue-500' },
    { title: 'Avg Occupancy', value: '78%', icon: Hotel, color: 'text-purple-500' },
  ];

  return (
    <div className="flex bg-background min-h-[calc(100vh-5rem)]">
      <Helmet>
        <title>Admin Dashboard | TravelDesk</title>
      </Helmet>
      
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
               <h2 className="text-4xl font-heading font-black tracking-tighter mb-2 uppercase">Platform Analytics</h2>
               <p className="text-textMuted font-bold uppercase tracking-widest text-xs">Real-time health monitoring of the TravelDesk ecosystem.</p>
            </div>
            <div className="flex items-center gap-4 p-2 glass rounded-2xl">
               <Calendar size={18} className="text-accent ml-2" />
               <select 
                  value={days}
                  onChange={(e) => dispatch(setDays(e.target.value))}
                  className="bg-transparent border-0 text-xs font-black uppercase text-accent focus:ring-0 cursor-pointer tracking-widest"
               >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
               </select>
               <button onClick={() => dispatch(fetchAnalytics(days))} className="p-2 rounded-xl hover:bg-white/5 text-textMuted transition-all">
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
               </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {kpis.map((kpi, i) => (
                <motion.div
                   key={kpi.title}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   className="glass-card flex items-center justify-between group hover:border-accent/30 transition-all"
                >
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{kpi.title}</p>
                      <h4 className="text-2xl font-mono font-black text-white">{kpi.value}</h4>
                   </div>
                   <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${kpi.color} group-hover:scale-110 transition-transform`}>
                      <SafeIcon icon={kpi.icon} size={24} />
                   </div>
                </motion.div>
             ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Bookings Trend */}
             <div className="glass-card">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em]">Booking Volume</h3>
                   <TrendingUp size={18} className="text-accent" />
                </div>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.bookings}>
                         <CartesianGrid strokeDasharray="3 3" stroke="#2D2D39" vertical={false} />
                         <XAxis dataKey="_id" stroke="#6B6B80" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis stroke="#6B6B80" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#00D4C8', fontWeight: 'bold' }}
                         />
                         <Line type="monotone" dataKey="count" stroke="#00D4C8" strokeWidth={3} dot={{ fill: '#00D4C8', r: 4 }} activeDot={{ r: 6, fill: '#00D4C8' }} />
                      </LineChart>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Revenue Distribution */}
             <div className="glass-card">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em]">Revenue Mix</h3>
                   <SafeIcon icon={LucideBarChart} size={18} className="text-secondary" />
                </div>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChartIcon data={data.revenue}>
                         <XAxis dataKey="_id" stroke="#6B6B80" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip cursor={{ fill: 'rgba(255,107,53,0.05)' }} contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                         <Bar dataKey="totalRevenue" fill="#FF6B35" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChartIcon>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Destinations */}
             <div className="glass-card lg:col-span-2">
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em] mb-8">Top Destinations</h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChartIcon data={data.destinations} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="_id" type="category" stroke="#6B6B80" fontSize={10} width={80} tickLine={false} axisLine={false} />
                         <Tooltip cursor={{ fill: 'rgba(0,212,200,0.03)' }} contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                         <Bar dataKey="count" fill="#00D4C8" radius={[0, 6, 6, 0]} barSize={20} />
                      </BarChartIcon>
                   </ResponsiveContainer>
                </div>
             </div>

             {/* Status Pie */}
             <div className="glass-card">
                <h3 className="text-sm font-heading font-black text-white uppercase tracking-[0.2em] mb-8">Booking Status</h3>
                <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                            data={data.status}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                         >
                            {data.status.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#12121A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
