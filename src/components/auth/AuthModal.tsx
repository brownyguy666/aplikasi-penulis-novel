'use client';

import React, { useState, useEffect } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { 
  signUpUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser 
} from '@/lib/supabaseClient';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  LogOut, 
  Check, 
  AlertCircle, 
  Loader2, 
  Cloud, 
  CloudOff,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { settings, currentUser, setCurrentUser } = useNovelStore();
  
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check initial user on modal open
  useEffect(() => {
    if (isOpen) {
      getCurrentUser(settings.supabaseUrl, settings.supabaseAnonKey)
        .then((user) => {
          if (user) {
            setCurrentUser({ id: user.id, email: user.email });
          } else {
            setCurrentUser(null);
          }
        })
        .catch(() => setCurrentUser(null));
    }
  }, [isOpen, settings.supabaseUrl, settings.supabaseAnonKey, setCurrentUser]);

  if (!isOpen) return null;

  const hasSupabaseConfig = Boolean(
    settings.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await signInUser(
        email, 
        password, 
        settings.supabaseUrl, 
        settings.supabaseAnonKey
      );
      if (data?.user) {
        setCurrentUser({ id: data.user.id, email: data.user.email });
        setSuccessMessage('Berhasil masuk! Akun Supabase Anda aktif.');
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal login. Periksa email & password Anda.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (password.length < 6) {
      setErrorMessage('Password minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await signUpUser(
        email, 
        password, 
        settings.supabaseUrl, 
        settings.supabaseAnonKey
      );
      if (data?.user) {
        setSuccessMessage('Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi, atau langsung login jika konfirmasi email dinonaktifkan di Supabase.');
        setTab('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar akun baru.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser(settings.supabaseUrl, settings.supabaseAnonKey);
      setCurrentUser(null);
      setSuccessMessage('Anda telah keluar dari akun.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-(--bg-secondary) border border-(--border-color) rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-(--border-color) flex items-center justify-between bg-linear-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-(--text-primary)">
                {currentUser ? 'Akun Penulis' : 'Autentikasi Akun Supabase'}
              </h3>
              <p className="text-[11px] text-(--text-muted)">
                {currentUser ? 'Sesi aktif di cloud Supabase' : 'Sinkronkan naskah novel ke cloud Supabase'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-primary) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Supabase Connection Status Pill */}
        <div className="px-5 py-2.5 bg-(--bg-primary) border-b border-(--border-color) flex items-center justify-between text-xs">
          <span className="text-[11px] text-(--text-muted)">Status Backend Cloud:</span>
          {hasSupabaseConfig ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <Cloud className="w-3.5 h-3.5" />
              <span>Supabase Terhubung</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
              <CloudOff className="w-3.5 h-3.5" />
              <span>Mode Lokal (Offline)</span>
            </span>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged In View */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-(--bg-primary) border border-(--border-color) space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-(--text-primary)">Profil Pengguna</span>
                </div>
                <div className="text-xs text-(--text-secondary) space-y-1">
                  <div><strong>Email:</strong> {currentUser.email || 'Email tidak tersedia'}</div>
                  <div className="text-[10px] text-(--text-muted) truncate font-mono">UID: {currentUser.id}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                Naskah novel Anda otomatis dapat disinkronkan ke akun ini saat tombol Cloud Sync ditekan.
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                <span>Keluar dari Akun (Log Out)</span>
              </button>
            </div>
          ) : (
            /* Login / Register Tabs */
            <div className="space-y-4">
              
              <div className="flex bg-(--bg-primary) p-1 rounded-xl border border-(--border-color) text-xs">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                    tab === 'login' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  Masuk (Login)
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMessage(null); }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-colors ${
                    tab === 'register' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-(--text-secondary) hover:text-(--text-primary)'
                  }`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-(--text-secondary)">Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-(--text-muted)" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="penulis@novel.com"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-(--text-secondary)">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-(--text-muted)" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : tab === 'login' ? (
                    <span>Masuk ke Studio</span>
                  ) : (
                    <span>Daftar Akun Penulis</span>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-center text-(--text-muted) leading-relaxed">
                Tanpa login, aplikasi tetap bekerja penuh menyimpan naskah secara lokal di peramban Anda.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
