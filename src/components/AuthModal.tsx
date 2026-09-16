import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, User as UserIcon, X } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const AuthModal: React.FC = () => {
  const { user, isAuthModalOpen, closeAuthModal, login, logout } = useUser();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email, name || email.split('@')[0]);
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={closeAuthModal}
    >
      <div
        id="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0e1017] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-serif font-black text-2xl shadow-lg shadow-amber-500/20 mb-2">
            V
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-serif">
            {user && !user.isGuest
              ? 'Your VEYRAH Account'
              : isSignUp
              ? 'Join VEYRAH'
              : 'Welcome Back'}
          </h2>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">
            {user && !user.isGuest
              ? `Signed in as ${user.email}`
              : 'Sync your watch history, personal list, and personalized cinema AI curation across all devices.'}
          </p>
        </div>

        {user && !user.isGuest ? (
          /* User Logged In State */
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-base">
                {user.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/20 text-amber-300 border border-amber-400/30">
                PRO PASS
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-white/5 text-xs text-zinc-400 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
              <span>
                Your profile is active. Cloud sync & Supabase persistence endpoints are enabled.
              </span>
            </div>

            <button
              onClick={() => {
                logout();
                closeAuthModal();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition-colors cursor-pointer"
            >
              Sign Out (Switch to Guest)
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Name</label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Alex Drake"
                    className="w-full bg-zinc-900 text-white placeholder-zinc-500 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cinema@veyrah.stream"
                  className="w-full bg-zinc-900 text-white placeholder-zinc-500 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                {!isSignUp && (
                  <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900 text-white placeholder-zinc-500 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold text-sm transition-all shadow-lg shadow-amber-400/20 cursor-pointer mt-2"
            >
              {isSignUp ? 'Create VEYRAH Profile' : 'Sign In'}
            </button>

            {/* Quick Demo One-Click Login */}
            <button
              type="button"
              onClick={() => {
                login('alex@veyrah.stream', 'Alex Cinema');
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 text-xs font-medium transition-colors"
            >
              Quick Demo Profile (Alex Cinema)
            </button>

            {/* Toggle Sign Up vs Sign In */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-zinc-400 hover:text-amber-300 transition-colors"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : 'New to VEYRAH? Create an account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
