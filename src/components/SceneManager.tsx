import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Play, Star, Plus, Trash2 } from 'lucide-react';
import { useHomeStore } from '../store/homeStore';
import { useState } from 'react';

export function SceneManager() {
  const { scenes, applyScene, toggleSceneFavorite, deleteScene, createScene, devices } =
    useHomeStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');

  const handleApplyScene = async (sceneId: string) => {
    try {
      await applyScene(sceneId);
    } catch (error) {
      console.error('Failed to apply scene:', error);
    }
  };

  const handleCreateScene = async () => {
    if (!newSceneName.trim()) return;

    try {
      const currentStates = devices.map((device) => ({
        device_id: device.id,
        status: device.status,
      }));

      await createScene({
        name: newSceneName,
        description: 'Custom scene',
        icon: 'Sparkles',
        device_states: currentStates,
        is_favorite: false,
      });

      setNewSceneName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create scene:', error);
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (confirm('Are you sure you want to delete this scene?')) {
      try {
        await deleteScene(sceneId);
      } catch (error) {
        console.error('Failed to delete scene:', error);
      }
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Scenes</h3>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Create new scene"
          >
            <Plus className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 bg-gray-700/50 rounded-lg border border-gray-600"
          >
            <input
              type="text"
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Scene name (e.g., Evening Relax)"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm mb-2"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateScene}
                disabled={!newSceneName.trim()}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                Save Current State
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewSceneName('');
                }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This will save the current state of all devices
            </p>
          </motion.div>
        )}

        {scenes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Icons.Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p>No scenes yet</p>
            <p className="text-sm mt-1">Create scenes to quickly set multiple devices</p>
          </div>
        ) : (
          scenes.map((scene) => {
            const IconComponent =
              (Icons as Record<string, React.FC<{ className?: string }>>)[scene.icon] ||
              Icons.Sparkles;

            return (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-700 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <IconComponent className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-white">{scene.name}</h4>
                        {scene.is_favorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      {scene.description && (
                        <p className="text-xs text-gray-500">{scene.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSceneFavorite(scene.id)}
                      className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                      title="Toggle favorite"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          scene.is_favorite
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-500'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleApplyScene(scene.id)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Apply
                    </button>
                    <button
                      onClick={() => handleDeleteScene(scene.id)}
                      className="p-1.5 hover:bg-red-600/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete scene"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
