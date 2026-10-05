import React from 'react';
import { Shield, Activity, History, BookOpen, LogOut, Database, UserCheck } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogout: () => void;
  dbType?: 'mongodb' | 'embedded_storage';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onLogout,
  dbType = 'embedded_storage',
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo-btn"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/50 transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white font-mono">WebShield</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Web Security Testing Platform</p>
            </div>
          </div>

          {/* Navigation Items (Only when logged in) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <button
                id="nav-dashboard-btn"
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                Dashboard
              </button>

              <button
                id="nav-scan-btn"
                onClick={() => onNavigate('scan')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'scan'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4" />
                Website Scan
              </button>

              <button
                id="nav-history-btn"
                onClick={() => onNavigate('history')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'history'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                Scan History
              </button>

              <button
                id="nav-docs-btn"
                onClick={() => onNavigate('docs')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'docs'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                B.Tech Project Guide
              </button>
            </nav>
          )}

          {/* Right Header Status & User Controls */}
          <div className="flex items-center gap-3">
            {/* DB Status Pill */}
            <div
              title={
                dbType === 'mongodb'
                  ? 'Connected to MongoDB Atlas / Server'
                  : 'Operating in Persistent Datastore Mode (Mongoose Compatible)'
              }
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{dbType === 'mongodb' ? 'MongoDB Active' : 'DB Engine Ready'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-200 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 leading-none mt-0.5 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  title="Sign out of WebShield"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-nav-btn"
                  onClick={() => onNavigate('login')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'login' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  id="nav-register-nav-btn"
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition-colors shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        {user && (
          <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`py-1 px-2 rounded ${currentPage === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('scan')}
              className={`py-1 px-2 rounded ${currentPage === 'scan' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              Scan
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`py-1 px-2 rounded ${currentPage === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
            >
              History
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className={`py-1 px-2 rounded ${currentPage === 'docs' ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}
            >
              Guide
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
