import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, Crown } from 'lucide-react';
import Alert from '../components/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAdmin();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Modern Gradient Background with Mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-[500px] h-[500px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Content Container */}
      <div className="max-w-[480px] w-full relative z-10">
        {/* Floating Particles */}
        <div className="absolute -top-12 -left-12 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full backdrop-blur-md border border-white/10 animate-float"></div>
        <div className="absolute -bottom-12 -right-12 w-16 h-16 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full backdrop-blur-md border border-white/10 animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-20 w-12 h-12 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full backdrop-blur-md border border-white/10 animate-float animation-delay-4000"></div>

        {/* Modern Logo Card with Glassmorphism */}
        <div className="relative group mb-8">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-[2rem] opacity-75 blur-xl group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
          
          {/* Glass Card */}
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-[2rem] p-10 border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center">
              {/* Icon with Multiple Rings */}
              <div className="relative mb-6">
                {/* Outer Rotating Rings */}
                <div className="absolute -inset-4 rounded-full border-2 border-dashed border-white/20 animate-spin-slow"></div>
                <div className="absolute -inset-2 rounded-full border-2 border-white/30 animate-spin-reverse"></div>
                
                {/* Main Icon Container */}
                <div className="relative w-24 h-24 bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-3xl shadow-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                  {/* Inner Glow */}
                  <div className="absolute inset-2 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-2xl blur-md"></div>
                  
                  {/* Shield Icon */}
                  <div className="relative">
                    <ShieldCheck className="w-16 h-16" stroke="url(#gradient)" strokeWidth={2} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="50%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* Crown Badge */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg animate-bounce">
                    <Crown className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
              
              {/* Title Section */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                  <h1 className="text-4xl font-black text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                    Admin Panel
                  </h1>
                  <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                </div>
                
                <p className="text-white/80 text-sm font-semibold tracking-wider">Premium Management System</p>
                
                {/* Decorative Divider */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  <Shield className="w-4 h-4 text-white/60" />
                  <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Login Form */}
        <div className="relative group">
          {/* Subtle Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] opacity-30 blur-lg group-hover:opacity-50 transition-all duration-300"></div>
          
          {/* Glass Form Container */}
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] p-10 border border-white/60">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-2 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm font-medium">Sign in to access your dashboard</p>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
                className="mb-6 animate-shake"
              />
            )}

              <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur-sm transition-opacity duration-300"></div>
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="relative w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none bg-white transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:border-gray-300"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-focus-within:opacity-10 blur-sm transition-opacity duration-300"></div>
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="relative w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none bg-white transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:border-gray-300"
                    placeholder="••••••••••"
                  />
                </div>
              </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden mt-6"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 rounded-xl transition-all duration-300"></div>
              
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-fuchsia-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {/* Button Content */}
              <div className="relative px-6 py-4 flex items-center justify-center gap-3 text-white font-bold text-base shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </div>
            </button>
            </form>

            {/* Modern Info Box */}
            <div className="mt-8 relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 blur group-hover:opacity-30 transition-all duration-300"></div>
              
              {/* Info Content */}
              <div className="relative p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-100/50 flex items-start gap-4 shadow-inner">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl flex-shrink-0 shadow-lg">
                  <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                    <span className="flex items-center gap-2 text-blue-700 mb-1">
                      <Shield className="w-4 h-4" />
                      Admin Access Only
                    </span>
                    This portal requires elevated admin privileges. Contact your system administrator if you need access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
