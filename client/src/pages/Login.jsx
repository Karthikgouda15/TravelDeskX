// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { damping: 50 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { damping: 50 });

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function resetMouse() {
    x.set(0);
    y.set(0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate('/flights');
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden relative selection:bg-white/10">
      <Helmet>
        <title>Identity | TravelDesk Pro</title>
      </Helmet>

      {/* Brand Panel (Left) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-20 overflow-hidden border-r border-white-[0.05]">
          {/* Animated Aurora */}
          <motion.div 
            animate={{ 
              x: [0, 50, -30, 0],
              y: [0, -40, 60, 0],
              scale: [1, 1.1, 0.9, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none"
          />
          
          <Link to="/" className="flex items-center gap-4 relative z-10 group">
             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <span className="font-sans font-black text-black text-lg tracking-tighter">TD</span>
             </div>
             <span className="font-sans font-bold text-2xl tracking-tight text-white">TravelDesk <span className="text-[10px] text-white/40 align-top ml-1">PRO</span></span>
          </Link>

          <div className="relative z-10 max-w-lg">
             <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className="text-7xl font-sans font-bold tracking-tightest mb-10 leading-[0.9] silver-text"
             >
                Unlimited <br /> horizons.
             </motion.h1>
             <p className="text-[#A1A1A1] text-lg font-light leading-relaxed max-w-sm">
                The enterprise standard for high-performance travel logistics. Precision engineered for the modern nomad.
             </p>
          </div>

          <div className="relative z-10 flex gap-12 pt-12 border-t border-white/[0.05]">
             {['Precision Architecture', 'Zero-Latency Engine'].map(label => (
                <div key={label} className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</span>
                   <span className="text-xs font-medium text-white/60">Verified Stable v8.4.1</span>
                </div>
             ))}
          </div>
      </div>

      {/* Form Panel (Right) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative perspective-1000" onMouseMove={handleMouse} onMouseLeave={resetMouse}>
         
         <motion.div 
            style={{ rotateX, rotateY }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-md glass-card p-12 relative overflow-hidden group"
         >
            {/* Subtle internal shine */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="mb-14">
               <h2 className="text-3xl font-sans font-bold tracking-tight mb-2 text-white">Welcome back.</h2>
               <p className="text-[#A1A1A1] text-sm font-light">Access your executive dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="space-y-3">
                  <label className="text-[11px] font-medium uppercase text-white/40 tracking-widest ml-1">Corporate Identity</label>
                  <div className="relative group/input">
                     <input
                        type="email"
                        required
                        placeholder="name@company.com"
                        className="input-field pl-12"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     />
                     <Mail size={18} className="absolute left-4 top-[18px] text-white/20 group-focus-within/input:text-white transition-colors" />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[11px] font-medium uppercase text-white/40 tracking-widest ml-1">Secure Key</label>
                  <div className="relative group/input">
                     <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="input-field pl-12 pr-12"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                     />
                     <Lock size={18} className="absolute left-4 top-[18px] text-white/20 group-focus-within/input:text-white transition-colors" />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-[18px] text-white/20 hover:text-white transition-colors"
                     >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
               </div>

               {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 border border-white/10 text-white text-xs font-medium rounded-xl flex items-center gap-3"
                  >
                     <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                     {error}
                  </motion.div>
               )}

               <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-3 group/btn"
               >
                  <span className="uppercase tracking-[0.2em] font-black">{isLoading ? 'Verifying...' : 'Authenticate'}</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
               </button>

               <div className="text-center pt-10 border-t border-white/[0.05]">
                  <p className="text-[11px] font-medium uppercase text-white/20 tracking-[0.15em]">
                     Unauthorized access is prohibited. <br />
                     <Link to="/register" className="text-white hover:opacity-70 transition-opacity mt-2 inline-block">Request Access v8.4.1</Link>
                  </p>
               </div>
            </form>
         </motion.div>
      </div>
    </div>
  );
};

export default Login;
