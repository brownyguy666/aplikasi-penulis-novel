'use client';

import React, { useState } from 'react';
import { useNovelStore } from '@/store/useNovelStore';
import { WritingRules } from '@/types/novel';
import { 
  X, 
  Key, 
  Cpu, 
  ShieldCheck, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Info,
  Check,
  Cloud,
  RefreshCw,
  Database,
  Loader2
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { 
    settings, 
    project, 
    updateSettings, 
    updateWritingRules,
    syncToCloud,
    pullFromCloud
  } = useNovelStore();

  const [activeTab, setActiveTab] = useState<'ai' | 'guardrails' | 'cloud'>('ai');

  // AI Settings
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel);
  const [customModelName, setCustomModelName] = useState(settings.customModelName || '');
  const [temperature, setTemperature] = useState(settings.temperature);

  // Writing Rules
  const [noEmDash, setNoEmDash] = useState(project.rules.noEmDash);
  const [pov, setPov] = useState(project.rules.pov);
  const [tense, setTense] = useState(project.rules.tense);
  const [narratorVoice, setNarratorVoice] = useState(project.rules.narratorVoice);

  // Supabase Settings
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const finalModel = selectedModel === 'custom' && customModelName.trim() 
      ? customModelName.trim() 
      : selectedModel;

    updateSettings({
      geminiApiKey: apiKey.trim(),
      selectedModel: finalModel,
      customModelName: customModelName.trim(),
      temperature,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim()
    });

    updateWritingRules({
      noEmDash,
      pov,
      tense,
      narratorVoice
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleTestSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      updateSettings({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim()
      });
      const res = await syncToCloud();
      setSyncStatusMsg(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi';
      setSyncStatusMsg(`Error: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullCloud = async () => {
    if (!confirm('Tindakan ini akan menimpa data naskah lokal dengan data yang ada di Supabase Cloud. Lanjutkan?')) {
      return;
    }
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      updateSettings({
        supabaseUrl: supabaseUrl.trim(),
        supabaseAnonKey: supabaseAnonKey.trim()
      });
      const res = await pullFromCloud();
      setSyncStatusMsg(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat dari cloud';
      setSyncStatusMsg(`Error: ${msg}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-(--bg-secondary) border border-(--border-color) shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border-color) flex items-center justify-between bg-(--bg-primary)">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Key className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-(--text-primary)">Pengaturan Studio Novel</h3>
              <p className="text-[11px] text-(--text-muted)">Konfigurasi AI Gemini 3.7, Guardrails Sastra & Cloud Sync</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-(--text-muted) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center border-b border-(--border-color) bg-(--bg-secondary) px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai' 
                ? 'border-amber-400 text-amber-400 font-bold' 
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Gemini 3.7</span>
          </button>

          <button
            onClick={() => setActiveTab('guardrails')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'guardrails' 
                ? 'border-amber-400 text-amber-400 font-bold' 
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Guardrails & POV</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'cloud' 
                ? 'border-amber-400 text-amber-400 font-bold' 
                : 'border-transparent text-(--text-secondary) hover:text-(--text-primary)'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase Cloud Sync</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* TAB 1: AI GEMINI CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-fade-in">
              {/* Gemini API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-(--text-primary) flex items-center gap-1.5">
                    <span>Google Gemini API Key</span>
                    <span className="text-[10px] text-amber-400 font-normal">(Disimpan di browser lokal)</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <span>Dapatkan API Key Gratis</span>
                    <HelpCircle className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:ring-1 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-(--text-muted) hover:text-(--text-primary)"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-(--text-muted)">
                  Jika tidak diisi di sini, sistem akan membaca dari environment variable <code>GEMINI_API_KEY</code> di server.
                </p>
              </div>

              {/* Model Selection with Gemini 3.7 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-(--text-primary) flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pilihan Model Gemini</span>
                  </label>
                  <select
                    value={['auto', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3.1-pro-preview', 'gemini-flash-latest', 'gemini-pro-latest', 'gemini-2.5-pro'].includes(selectedModel) ? selectedModel : 'custom'}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setSelectedModel('custom');
                      } else {
                        setSelectedModel(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none font-medium"
                  >
                    <option value="auto">✨ Auto (Gemini 2.5 Flash - Kuota 1.500 RPD / Bebas Limit)</option>
                    <optgroup label="⚡ Model Kuota Tinggi (1.500 RPD - Sangat Direkomendasikan)">
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (1.500 RPD / Super Cepat)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (1.500 RPD / Responsif)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (1.500 RPD / Stabil)</option>
                    </optgroup>
                    <optgroup label="🌟 Model Seri 3.x (Kuota Terbatas ~20-50 RPD)">
                      <option value="gemini-3.6-flash">Gemini 3.6 Flash (Sastrawi)</option>
                      <option value="gemini-3.7-flash">Gemini 3.7 Flash (Eksperimental)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning)</option>
                    </optgroup>
                    <optgroup label="Auto-Latest Models">
                      <option value="gemini-flash-latest">Gemini Flash Latest</option>
                      <option value="gemini-pro-latest">Gemini Pro Latest</option>
                    </optgroup>
                    <option value="custom">Ketik Model ID Manual...</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-(--text-primary)">Kreativitas (Temperature)</label>
                    <span className="font-mono text-amber-400">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-(--text-muted)">
                    <span>Presisi (0.2)</span>
                    <span>Seimbang (0.7)</span>
                    <span>Puitis (1.0)</span>
                  </div>
                </div>
              </div>

              {/* Custom Model ID Input if selected */}
              {(selectedModel === 'custom' || !['gemini-3.7-flash', 'gemini-3.7-pro', 'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'].includes(selectedModel)) && (
                <div className="p-3 rounded-xl bg-(--bg-primary) border border-amber-500/30 space-y-1.5 animate-fade-in">
                  <label className="font-bold text-amber-400">Nama Model ID Kustom</label>
                  <input
                    type="text"
                    value={customModelName || selectedModel}
                    onChange={(e) => {
                      setCustomModelName(e.target.value);
                      setSelectedModel(e.target.value);
                    }}
                    placeholder="misal: gemini-3.7-thinking, gemini-experimental..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-(--bg-secondary) border border-(--border-color) text-(--text-primary) focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WRITING GUARDRAILS */}
          {activeTab === 'guardrails' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noEmDash}
                    onChange={(e) => setNoEmDash(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                  />
                  <div className="space-y-0.5">
                    <span className="font-bold text-(--text-primary)">
                      Larangan Em-Dash (&ldquo;—&rdquo;) dalam Naskah Fiksi
                    </span>
                    <p className="text-[11px] text-(--text-secondary) leading-snug">
                      AI dan editor akan dilarang menggunakan karakter em-dash (&ldquo;—&rdquo;) dan memprioritaskan tanda koma atau tanda hubung standar.
                    </p>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-(--text-secondary)">Sudut Pandang (POV)</label>
                  <select
                    value={pov}
                    onChange={(e) => setPov(e.target.value as WritingRules['pov'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  >
                    <option value="first_person">Orang Pertama (&ldquo;Aku / Saya&rdquo;)</option>
                    <option value="third_limited">Orang Ketiga Terbatas (&ldquo;Ia / Dia / Nama&rdquo;)</option>
                    <option value="third_omniscient">Orang Ketiga Serba Tahu</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-(--text-secondary)">Kala Waktu (Tense)</label>
                  <select
                    value={tense}
                    onChange={(e) => setTense(e.target.value as WritingRules['tense'])}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                  >
                    <option value="past">Masa Lampau (Past Tense)</option>
                    <option value="present">Kala Kini (Present Tense)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-(--text-secondary)">Catatan Suara Narator (Narrator Voice)</label>
                <textarea
                  value={narratorVoice}
                  onChange={(e) => setNarratorVoice(e.target.value)}
                  rows={2}
                  placeholder="Misal: Bernada khidmat, atmosferik, menggunakan metafora tarikh klasik..."
                  className="w-full p-2.5 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE CLOUD SYNC */}
          {activeTab === 'cloud' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Sinkronisasi Database Cloud Supabase (PostgreSQL)</span>
                </div>
                <p className="text-[11px] text-(--text-secondary) leading-snug">
                  Secara default, naskah tersimpan offline di IndexedDB peramban lokal. Hubungkan ke project Supabase Anda untuk mencadangkan naskah ke database cloud.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-(--text-secondary)">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-(--text-secondary)">Supabase Anon / Public API Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-(--bg-primary) border border-(--border-color) text-(--text-primary) focus:outline-none font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestSync}
                    disabled={isSyncing || !supabaseUrl.trim() || !supabaseAnonKey.trim()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 transition-colors flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cloud className="w-3.5 h-3.5" />}
                    <span>Push & Cadangkan ke Cloud</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullCloud}
                    disabled={isSyncing || !supabaseUrl.trim() || !supabaseAnonKey.trim()}
                    className="px-3.5 py-2 rounded-xl bg-(--bg-primary) border border-cyan-500/40 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-slate-950 disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Pull / Muat dari Cloud</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <div className="p-3 rounded-xl bg-(--bg-primary) border border-(--border-color) text-[11px] text-amber-400 animate-fade-in font-mono">
                    {syncStatusMsg}
                  </div>
                )}

                {settings.lastCloudSyncedAt && (
                  <div className="text-[11px] text-(--text-muted)">
                    Terakhir disinkronkan ke cloud: <strong>{settings.lastCloudSyncedAt}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-(--bg-primary) border border-(--border-color) flex items-center gap-2 text-[11px] text-(--text-muted)">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Semua data proyek disimpan otomatis secara lokal di IndexedDB peramban Anda.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-(--border-color) flex items-center justify-end gap-2 bg-(--bg-primary)">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-(--text-secondary) hover:bg-(--bg-secondary) rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
