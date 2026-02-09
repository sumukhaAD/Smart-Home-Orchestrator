import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Zap, Save, ExternalLink } from 'lucide-react';
import { useHomeStore } from '../store/homeStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { getSetting, updateSetting } = useHomeStore();
  const [geminiKey, setGeminiKey] = useState('');
  const [scaledownKey, setScaledownKey] = useState('');
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const apiKeySetting = getSetting('api_keys');
      if (apiKeySetting) {
        setGeminiKey((apiKeySetting.value.gemini_api_key as string) || '');
        setScaledownKey((apiKeySetting.value.scaledown_api_key as string) || '');
        setCompressionEnabled((apiKeySetting.value.compression_enabled as boolean) || false);
      }
    }
  }, [isOpen, getSetting]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSetting('api_keys', {
        gemini_api_key: geminiKey,
        scaledown_api_key: scaledownKey,
        compression_enabled: compressionEnabled,
      });

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">API Keys</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gemini API Key
                    <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for AI voice control.{' '}
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                    >
                      Get API key
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ScaleDown API Key
                    <span className="text-gray-500 ml-1">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={scaledownKey}
                    onChange={(e) => setScaledownKey(e.target.value)}
                    placeholder="Enter your ScaleDown API key"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: For token optimization and cost reduction
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Optimization</h3>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <h4 className="text-sm font-medium text-white">
                    Enable Prompt Compression
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Reduces token usage using ScaleDown API
                  </p>
                </div>
                <button
                  onClick={() => setCompressionEnabled(!compressionEnabled)}
                  disabled={!scaledownKey}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    compressionEnabled ? 'bg-amber-500' : 'bg-gray-700'
                  } ${!scaledownKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"
                    animate={{ left: compressionEnabled ? '30px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">
                Quick Start Guide
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>1. Get a Gemini API key from Google AI Studio</li>
                <li>2. Enter your API key above and click Save</li>
                <li>3. Try commands like "Turn on living room lights"</li>
                <li>4. Use voice input by clicking the microphone button</li>
              </ul>
            </div>
          </div>

          <div className="p-6 border-t border-gray-700 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
