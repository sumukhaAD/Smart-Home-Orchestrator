import { create } from 'zustand';
import type {
  Room,
  Device,
  ActivityLog,
  Scene,
  Settings,
  TokenStats,
  DeviceStatus,
} from '../types';
import { supabaseService } from '../services/supabase';

interface HomeStore {
  rooms: Room[];
  devices: Device[];
  activityLogs: ActivityLog[];
  scenes: Scene[];
  settings: Settings[];
  securityMode: 'armed' | 'disarmed' | 'away';
  tokenStats: TokenStats;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  updateDevice: (deviceId: string, status: DeviceStatus, trigger: 'ai' | 'manual' | 'scene') => Promise<void>;
  addActivityLog: (log: Omit<ActivityLog, 'id' | 'created_at'>) => Promise<void>;
  createScene: (scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteScene: (sceneId: string) => Promise<void>;
  toggleSceneFavorite: (sceneId: string) => Promise<void>;
  applyScene: (sceneId: string) => Promise<void>;
  updateSetting: (key: string, value: Record<string, unknown>) => Promise<void>;
  getSetting: (key: string) => Settings | undefined;
  setSecurityMode: (mode: 'armed' | 'disarmed' | 'away') => void;
  updateTokenStats: (stats: Partial<TokenStats>) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  rooms: [],
  devices: [],
  activityLogs: [],
  scenes: [],
  settings: [],
  securityMode: 'disarmed',
  tokenStats: {
    original_tokens: 0,
    compressed_tokens: 0,
    tokens_saved: 0,
    compression_ratio: 1.0,
    session_tokens_saved: 0,
  },
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabaseService.initializeDemo();

      const [rooms, devices, activityLogs, scenes, settings] = await Promise.all([
        supabaseService.getRooms(),
        supabaseService.getDevices(),
        supabaseService.getActivityLogs(50),
        supabaseService.getScenes(),
        supabaseService.getSettings(),
      ]);

      set({
        rooms,
        devices,
        activityLogs,
        scenes,
        settings,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isLoading: false,
      });
    }
  },

  updateDevice: async (deviceId: string, status: DeviceStatus, trigger: 'ai' | 'manual' | 'scene') => {
    try {
      const currentDevice = get().devices.find((d) => d.id === deviceId);
      if (!currentDevice) {
        throw new Error('Device not found');
      }

      const updatedDevice = await supabaseService.updateDevice(deviceId, status);

      set((state) => ({
        devices: state.devices.map((d) =>
          d.id === deviceId ? updatedDevice : d
        ),
      }));

      await get().addActivityLog({
        device_id: deviceId,
        room_id: currentDevice.room_id,
        action_type: 'device_update',
        previous_state: currentDevice.status,
        new_state: status,
        trigger,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update device',
      });
      throw error;
    }
  },

  addActivityLog: async (log: Omit<ActivityLog, 'id' | 'created_at'>) => {
    try {
      const newLog = await supabaseService.createActivityLog(log);
      set((state) => ({
        activityLogs: [newLog, ...state.activityLogs].slice(0, 50),
      }));
    } catch (error) {
      console.error('Failed to add activity log:', error);
    }
  },

  createScene: async (scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newScene = await supabaseService.createScene(scene);
      set((state) => ({
        scenes: [...state.scenes, newScene],
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create scene',
      });
      throw error;
    }
  },

  deleteScene: async (sceneId: string) => {
    try {
      await supabaseService.deleteScene(sceneId);
      set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== sceneId),
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete scene',
      });
      throw error;
    }
  },

  toggleSceneFavorite: async (sceneId: string) => {
    try {
      const scene = get().scenes.find((s) => s.id === sceneId);
      if (!scene) return;

      const updatedScene = await supabaseService.updateScene(sceneId, {
        is_favorite: !scene.is_favorite,
      });

      set((state) => ({
        scenes: state.scenes.map((s) => (s.id === sceneId ? updatedScene : s)),
      }));
    } catch (error) {
      console.error('Failed to toggle scene favorite:', error);
    }
  },

  applyScene: async (sceneId: string) => {
    try {
      const scene = get().scenes.find((s) => s.id === sceneId);
      if (!scene) throw new Error('Scene not found');

      for (const deviceState of scene.device_states) {
        await get().updateDevice(deviceState.device_id, deviceState.status, 'scene');
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      await get().addActivityLog({
        action_type: 'scene_applied',
        trigger: 'manual',
        command: `Applied scene: ${scene.name}`,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to apply scene',
      });
      throw error;
    }
  },

  updateSetting: async (key: string, value: Record<string, unknown>) => {
    try {
      const updatedSetting = await supabaseService.upsertSetting(key, value);
      set((state) => {
        const existingIndex = state.settings.findIndex((s) => s.key === key);
        if (existingIndex >= 0) {
          const newSettings = [...state.settings];
          newSettings[existingIndex] = updatedSetting;
          return { settings: newSettings };
        } else {
          return { settings: [...state.settings, updatedSetting] };
        }
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update setting',
      });
      throw error;
    }
  },

  getSetting: (key: string) => {
    return get().settings.find((s) => s.key === key);
  },

  setSecurityMode: (mode: 'armed' | 'disarmed' | 'away') => {
    set({ securityMode: mode });
  },

  updateTokenStats: (stats: Partial<TokenStats>) => {
    set((state) => ({
      tokenStats: {
        ...state.tokenStats,
        ...stats,
      },
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },

  refreshData: async () => {
    try {
      const [devices, activityLogs] = await Promise.all([
        supabaseService.getDevices(),
        supabaseService.getActivityLogs(50),
      ]);

      set({ devices, activityLogs });
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  },
}));
