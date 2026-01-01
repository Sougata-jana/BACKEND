import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  TrendingUp,
  Users,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAdmin();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/videos', icon: Video, label: 'Videos' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/channels', icon: Users, label: 'Channels' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen w-72 bg-linear-to-b from-[#0D1326] to-[#0A0F1E] text-white flex flex-col border-r border-white/5 relative">
      
      {/* Brand Section */}
      <div className="px-6 py-10 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-3 bg-linear-to-br from-[#7C7CFF] to-[#2EE6D6] rounded-xl shadow-lg shadow-[#7C7CFF]/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400">Management Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-5 rounded-xl transition-all group ${
              isActive(item.path)
                ? 'bg-[#7C7CFF]/10 border border-[#7C7CFF]/30 shadow-lg shadow-[#7C7CFF]/10'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className={`p-3 rounded-lg transition-all ${
              isActive(item.path) 
                ? 'bg-[#7C7CFF]/20' 
                : 'bg-white/5 group-hover:bg-white/10'
            }`}>
              <item.icon className={`w-6 h-6 transition-colors ${
                isActive(item.path) ? 'text-[#7C7CFF]' : 'text-gray-400 group-hover:text-white'
              }`} />
            </div>
            <span className={`font-medium text-lg transition-colors ${
              isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-white'
            }`}>
              {item.label}
            </span>
            {isActive(item.path) && (
              <div className="ml-auto">
                <div className="w-1.5 h-1.5 bg-[#7C7CFF] rounded-full"></div>
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="px-4 py-8 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-5 rounded-xl bg-white/5 hover:bg-[#F43F5E]/10 border border-white/5 hover:border-[#F43F5E]/30 transition-all group"
        >
          <div className="p-3 bg-[#F43F5E]/10 rounded-lg border border-[#F43F5E]/20 group-hover:bg-[#F43F5E]/20 transition-all">
            <LogOut className="w-6 h-6 text-[#F43F5E]" />
          </div>
          <span className="font-medium text-lg text-gray-400 group-hover:text-[#F43F5E] transition-colors">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
