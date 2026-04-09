// src/pages/Register.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      navigate('/flights');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Helmet>
        <title>Register | TravelDesk</title>
      </Helmet>

      {/* Brand Panel (Left) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-16 overflow-hidden">
         <div className="bg-animated-grid"></div>
         <div className="bg-ambient-glow"></div>
         
         <Link to="/" className="flex items-center gap-2 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-blue-500 flex items-center justify-center shadow-lg shadow-accent/20">
               <span className="font-heading font-extrabold text-background text-2xl">TD</span>
            </div>
            <span className="font-heading font-extrabold text-3xl tracking-tighter">Travel<span className="text-accent">Desk</span></span>
         </Link>

         <div className="relative z-10 max-w-lg">
            <motion.h1 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-6xl font-heading font-black tracking-tighter mb-6 leading-none"
            >
               JOIN THE <br /> <span className="text-secondary">ELITE.</span>
            </motion.h1>
            <p className="text-textMuted font-bold uppercase tracking-widest text-sm leading-loose">
               Create your enterprise profile and unlock access to the world's most advanced travel inventory management system.
            </p>
         </div>

         <div className="relative z-10 flex gap-12 border-t border-white/5 pt-12">
            {[
               { icon: ShieldCheck, label: 'Secure Onboarding' },
               { icon: Zap, label: 'Instant Role Access' },
            ].map(item => (
               <div key={item.label} className="flex items-center gap-3">
                  <item.icon size={20} className="text-accent" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.label}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
         <div className="lg:hidden bg-animated-grid"></div>
         
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-card p-10"
         >
            <div className="mb-10">
               <h2 className="text-3xl font-heading font-black tracking-tighter mb-2 uppercase">Create Profile</h2>
               <p className="text-textMuted font-bold uppercase tracking-widest text-[10px]">Initialize your identity in the portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Full Name</label>
                  <div className="relative">
                     <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="input-field pl-12"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     />
                     <User size={18} className="absolute left-4 top-3.5 text-textMuted" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Email Address</label>
                  <div className="relative">
                     <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        className="input-field pl-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     />
                     <Mail size={18} className="absolute left-4 top-3.5 text-textMuted" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Password</label>
                  <div className="relative">
                     <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="input-field pl-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     />
                     <Lock size={18} className="absolute left-4 top-3.5 text-textMuted" />
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-accent tracking-[0.2em]">Access Role</label>
                  <div className="grid grid-cols-2 gap-4">
                     {['user', 'airline_staff'].map(role => (
                        <button
                           key={role}
                           type="button"
                           onClick={() => setFormData({ ...formData, role })}
                           className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                              ${formData.role === role ? 'bg-accent/10 border-accent/50 text-accent' : 'bg-white/5 border-white/5 text-textMuted'}
                           `}
                        >
                           {role}
                        </button>
                     ))}
                  </div>
               </div>

               {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-xl">
                     {error}
                  </div>
               )}

               <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 uppercase tracking-[0.2em] font-black flex items-center justify-center gap-3 group"
               >
                  {isLoading ? 'Processing Request...' : 'Initialize Profile'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>

               <div className="text-center pt-8 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase text-textMuted tracking-widest">
                     Already registered? {' '}
                     <Link to="/login" className="text-accent hover:brightness-125 transition-all">Sign In</Link>
                  </p>
               </div>
            </form>
         </motion.div>
      </div>
    </div>
  );
};

export default Register;
