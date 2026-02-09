import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { RoomCard } from './components/RoomCard';
import { CommandBar } from './components/CommandBar';
import { ActivityLog } from './components/ActivityLog';
import { SceneManager } from './components/SceneManager';
import { SettingsModal } from './components/SettingsModal';
import { AIResponseToast } from './components/AIResponseToast';
import { useHomeStore } from './store/homeStore';
import { Loader2 } from 'lucide-react';

function App() {
  const { rooms, isLoading, initialize, error } = useHomeStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleAIResponse = (message: string, isError = false) => {
    setAiResponse({ message, isError });
  };

  const clearAIResponse = () => {
    setAiResponse(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Initializing Smart Home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Error: {error}</p>
          <button
            onClick={() => initialize()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rooms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SceneManager />
            <ActivityLog />
          </div>
        </div>
      </main>

      <CommandBar onResponse={handleAIResponse} />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {aiResponse && (
        <AIResponseToast
          message={aiResponse.message}
          isError={aiResponse.isError}
          onClose={clearAIResponse}
        />
      )}
    </div>
  );
}

export default App;
