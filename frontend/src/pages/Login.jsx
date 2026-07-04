import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role.toLowerCase() === 'admin') navigate('/admin/dashboard');
      else if (user.role.toLowerCase() === 'inventory') navigate('/inventory/dashboard');
      else navigate('/clinic/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      if (userData.role.toLowerCase() === 'admin') navigate('/admin/dashboard');
      else if (userData.role.toLowerCase() === 'inventory') navigate('/inventory/dashboard');
      else navigate('/clinic/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Panel: Graphic / Brand Side */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        {/* Richer Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-teal-500 z-0"></div>
        
        {/* Radial Lighting / Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent z-0 mix-blend-overlay"></div>
        
        {/* Medical / Dental SVG Pattern Overlay (Subtle Abstract) */}
        <div className="absolute inset-0 z-0 opacity-[0.07] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTIwIDBoMnY0MGgtMnoiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCAyMGg0MHYyaC00MHoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat"></div>

        {/* Animated Shapes for depth */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full bg-white opacity-10 blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-teal-300 opacity-20 blur-3xl"
        />

        <div className="relative z-10 text-white mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center text-blue-600 shadow-xl shadow-blue-900/20">
                <Stethoscope size={28} strokeWidth={2.5} />
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-white drop-shadow-sm">Oasis Dental Care</h1>
            </div>
            <p className="text-blue-100/90 font-semibold tracking-[0.15em] mt-2 ml-[62px] text-xs uppercase drop-shadow-sm">Clinic Management System</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl font-extrabold leading-[1.15] tracking-tight mb-6 drop-shadow-sm">
              Streamline your <br/> clinic operations.
            </h2>
            <p className="text-lg text-blue-50/90 max-w-md leading-relaxed font-medium">
              A comprehensive platform designed specifically for modern dental clinics. Manage appointments, patient records, and inventory seamlessly.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 text-blue-200/80 text-sm font-medium">
          &copy; {new Date().getFullYear()} Oasis Dental Care Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Login Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          /* Soft background, crisp white card, elevated shadow, delicate border */
          className="w-full max-w-md p-10 sm:p-12 bg-white rounded-[28px] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-10 justify-center text-blue-600">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Stethoscope size={26} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Oasis Dental Care</h1>
            </div>
            <p className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Clinic Management System</p>
          </div>

          <div className="text-center mb-10">
            <h3 className="text-[26px] font-bold text-slate-900 tracking-tight">Welcome back</h3>
            <p className="text-slate-500 mt-2 text-[15px] font-medium">Enter your credentials to access your account.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 flex items-center gap-2.5 font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5 relative group">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-sm hover:border-slate-300"
                  placeholder="name@clinic.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5 relative group">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-[3px] focus:ring-blue-600/20 focus:border-blue-600 transition-all duration-200 shadow-sm hover:border-slate-300"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-[3px] focus:ring-blue-600/30 focus:ring-offset-1 shadow-lg shadow-blue-600/25 transition-all duration-200 mt-8",
                isLoading && "opacity-80 cursor-not-allowed hover:translate-y-0 hover:bg-blue-600 shadow-none active:scale-100"
              )}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Sign in to Dashboard"
              )}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-10 text-center">
            <p className="text-[13px] font-medium text-slate-400">&copy; {new Date().getFullYear()} Oasis Dental Care. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
