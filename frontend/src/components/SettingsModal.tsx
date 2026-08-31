import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredBackendUrl, setStoredBackendUrl, checkBackendHealth } from '../services/api';
import { SlidersHorizontal, CheckCircle2, AlertCircle, Server, X, RefreshCw, Globe, Laptop } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndpointUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onEndpointUpdated }) => {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);

  const HF_SPACE_URL = 'https://thinkmeem-islamic-research-engine.hf.space';
  const LOCAL_DEV_URL = 'http://localhost:8000';

  useEffect(() => {
    if (isOpen) {
      const current = getStoredBackendUrl();
      setUrl(current);
      testEndpoint(current);
    }
  }, [isOpen]);

  const testEndpoint = async (targetUrl: string) => {
    if (!targetUrl) return;
    setIsChecking(true);
    const ok = await checkBackendHealth(targetUrl);
    setHealthStatus(ok);
    setIsChecking(false);
  };

  const handleSave = () => {
    setStoredBackendUrl(url);
    onEndpointUpdated();
    onClose();
  };

  const handleSetUrl = (newUrl: string) => {
    setUrl(newUrl);
    testEndpoint(newUrl);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg glass-panel border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Server & Backend Settings
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5">
            
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Quick Presets:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSetUrl(HF_SPACE_URL)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    url === HF_SPACE_URL
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hugging Face Space</span>
                  </div>
                  <div className="text-[10px] truncate opacity-75">thinkmeem-islamic-research-engine</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetUrl(LOCAL_DEV_URL)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    url === LOCAL_DEV_URL
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 shadow-sm'
                      : 'bg-slate-900/60 border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                    <Laptop className="w-3.5 h-3.5 text-teal-400" />
                    <span>Local Server</span>
                  </div>
                  <div className="text-[10px] opacity-75">localhost:8000</div>
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Backend Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setHealthStatus(null);
                  }}
                  placeholder="https://your-space.hf.space"
                  className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-2xl text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => testEndpoint(url)}
                  disabled={isChecking}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-white/10 rounded-2xl text-xs font-semibold text-slate-200 transition-all shadow-sm"
                >
                  {isChecking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Server className="w-3.5 h-3.5" />
                  )}
                  <span>Test Ping</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Card */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Connection Status:</span>
                {isChecking ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking server...
                  </span>
                ) : healthStatus === true ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Live Backend Connected
                  </span>
                ) : healthStatus === false ? (
                  <span className="text-amber-300 flex items-center gap-1.5 font-semibold">
                    <AlertCircle className="w-4 h-4" /> Server Offline (Local Fallback Active)
                  </span>
                ) : (
                  <span className="text-slate-500">Not Tested</span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {healthStatus === true
                  ? 'Your backend is active and ready to perform live vector search and grounded Gemini synthesis.'
                  : 'If your backend is offline, the interface seamlessly falls back to the embedded authentic manuscript corpus.'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.08] bg-slate-900/40 flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSetUrl(HF_SPACE_URL)}
              className="text-xs text-slate-400 hover:text-emerald-300 transition-colors"
            >
              Reset to Hugging Face
            </button>
            
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
