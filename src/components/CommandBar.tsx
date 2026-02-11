import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Loader2, Sparkles } from 'lucide-react';
import { useHomeStore } from '../store/homeStore';
import { GeminiService } from '../services/geminiService';
import { ScaleDownService } from '../services/scaledownService';
import type { DeviceStatus } from '../types';

interface CommandBarProps {
  onResponse: (message: string, isError?: boolean) => void;
}

export function CommandBar({ onResponse }: CommandBarProps) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { rooms, devices, updateDevice, getSetting, addActivityLog, updateTokenStats, tokenStats } =
    useHomeStore();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const quickActions = [
    'Turn on living room lights',
    'Set bedroom AC to 22°C',
    'Good morning',
    'Goodnight',
  ];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as typeof window & { webkitSpeechRecognition?: typeof window.SpeechRecognition })
          .webkitSpeechRecognition || window.SpeechRecognition;
      
      console.log('🎤 Speech Recognition Available:', !!SpeechRecognition);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice recognition result:', transcript);
        setCommand(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Voice recognition error:', event.error);
        setIsListening(false);
        onResponse(`Voice recognition failed: ${event.error}. Please try again.`, true);
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('⚠️  Speech Recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResponse]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      console.error('❌ Speech recognition not initialized');
      onResponse('Voice recognition is not supported in your browser. Try Chrome or Edge.', true);
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping voice recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        console.log('▶️  Starting voice recognition');
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Failed to start voice recognition:', error);
        setIsListening(false);
        onResponse('Failed to start voice recognition. Please try again.', true);
      }
    }
  };

  const processCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsProcessing(true);
    setCommand('');

    console.log('\n========================================');
    console.log('🎯 PROCESSING COMMAND:', cmd);
    console.log('========================================\n');

    try {
      const apiKeySetting = getSetting('api_keys');
      const geminiKey = apiKeySetting?.value?.gemini_api_key as string | undefined;
      const scaledownKey = apiKeySetting?.value?.scaledown_api_key as string | undefined;
      const compressionEnabled = apiKeySetting?.value?.compression_enabled as boolean | undefined;

      console.log('⚙️  Settings:');
      console.log(`  Gemini API Key: ${geminiKey ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  ScaleDown API Key: ${scaledownKey ? '✅ Configured' : '❌ Missing'}`);
      console.log(`  Compression Enabled: ${compressionEnabled ? '✅ Yes' : '❌ No'}\n`);

      if (!geminiKey || geminiKey.trim() === '') {
        onResponse(
          'Please configure your Gemini API key in Settings to use AI commands.',
          true
        );
        setIsProcessing(false);
        return;
      }

      const geminiService = new GeminiService(geminiKey);
      
      // Initialize ScaleDown service if enabled
let scaledownService: ScaleDownService | undefined;
let compressionFunction: ((text: string) => Promise<string>) | undefined;

if (compressionEnabled && scaledownKey && scaledownKey.trim() !== '') {
  console.log('🔧 Initializing ScaleDown service...');
  scaledownService = new ScaleDownService(scaledownKey);
  
  // Create compression function that returns just the compressed text
  compressionFunction = async (text: string) => {
    // We can optionally separate context and prompt for better compression
    // For now, we'll compress the entire prompt
    const result = await scaledownService!.compressPrompt(text, '');
    return result.compressed_prompt;
  };
}

      // Process command with integrated compression
      const response = await geminiService.processCommand(
        cmd,
        rooms,
        devices,
        compressionEnabled && !!scaledownService,
        compressionFunction
      );

      // Note: Token stats are now logged in geminiService.ts
      // But we can also update the UI stats here if needed
      console.log('\n✅ Command processed successfully');
      console.log('📋 Response:', response.confirmation);

      if (response.actions && response.actions.length > 0) {
        console.log(`\n🔄 Executing ${response.actions.length} action(s)...`);
        
        for (let i = 0; i < response.actions.length; i++) {
          const action = response.actions[i];
          const deviceId = (action as { device_id?: string }).device_id;
          const status = (action as { status?: DeviceStatus }).status;

          if (deviceId && status) {
            console.log(`  ${i + 1}. Updating device ${deviceId}:`, status);
            await updateDevice(deviceId, status, 'ai');
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }

        await addActivityLog({
          action_type: 'ai_command',
          trigger: 'ai',
          command: cmd,
        });
        
        console.log('✅ All actions executed successfully');
      } else {
        console.log('ℹ️  No actions to execute');
      }

      onResponse(response.confirmation);

      if (response.suggestions && response.suggestions.length > 0) {
        console.log('💡 Suggestions:', response.suggestions);
        setTimeout(() => {
          onResponse(`Suggestions: ${response.suggestions!.join(', ')}`);
        }, 1000);
      }

      console.log('\n========================================');
      console.log('✅ COMMAND COMPLETED SUCCESSFULLY');
      console.log('========================================\n');

    } catch (error) {
      console.error('\n========================================');
      console.error('❌ COMMAND PROCESSING FAILED');
      console.error('========================================');
      console.error('Error details:', error);
      console.error('========================================\n');
      
      onResponse(
        error instanceof Error ? error.message : 'Failed to process command. Please try again.',
        true
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProcessing && command.trim()) {
      processCommand(command);
    }
  };

  const handleQuickAction = (action: string) => {
    setCommand(action);
    processCommand(action);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={isProcessing}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {action}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Tell me what you'd like to do..."
                  disabled={isProcessing || isListening}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                />
                {isListening && (
                  <motion.div
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </motion.div>
                )}
              </div>

              {recognitionRef.current && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isProcessing}
                  className={`px-4 py-3 rounded-xl transition-all disabled:opacity-50 ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  title={isListening ? 'Stop recording' : 'Start voice input'}
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}

              <button
                type="submit"
                disabled={isProcessing || !command.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="hidden sm:inline">Processing</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>

            {tokenStats.session_tokens_saved > 0 && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>
                  Session tokens saved: {tokenStats.session_tokens_saved.toLocaleString()} (
                  {Math.round((1 - tokenStats.compression_ratio) * 100)}% compression)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}