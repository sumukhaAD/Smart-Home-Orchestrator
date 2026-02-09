import { createClient } from '@supabase/supabase-js';
import type { Room, Device, ActivityLog, Scene, Settings } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseService = {
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getDevices(): Promise<Device[]> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getDevicesByRoom(roomId: string): Promise<Device[]> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('room_id', roomId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateDevice(deviceId: string, status: Record<string, unknown>): Promise<Device> {
    const { data, error } = await supabase
      .from('devices')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getActivityLogs(limit = 50): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getScenes(): Promise<Scene[]> {
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createScene(scene: Omit<Scene, 'id' | 'created_at' | 'updated_at'>): Promise<Scene> {
    const { data, error } = await supabase
      .from('scenes')
      .insert(scene)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateScene(sceneId: string, updates: Partial<Scene>): Promise<Scene> {
    const { data, error } = await supabase
      .from('scenes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', sceneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteScene(sceneId: string): Promise<void> {
    const { error } = await supabase.from('scenes').delete().eq('id', sceneId);
    if (error) throw error;
  },

  async getSettings(): Promise<Settings[]> {
    const { data, error } = await supabase.from('settings').select('*');

    if (error) throw error;
    return data || [];
  },

  async getSetting(key: string): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async upsertSetting(key: string, value: Record<string, unknown>): Promise<Settings> {
    const { data, error } = await supabase
      .from('settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async initializeDemo(): Promise<void> {
    const { data: existingRooms } = await supabase
      .from('rooms')
      .select('id')
      .limit(1);

    if (existingRooms && existingRooms.length > 0) {
      return;
    }

    const rooms = [
      {
        name: 'Living Room',
        slug: 'living_room',
        accent_color: '#3B82F6',
        icon: 'Sofa',
        display_order: 1,
      },
      {
        name: 'Bedroom',
        slug: 'bedroom',
        accent_color: '#F97316',
        icon: 'Bed',
        display_order: 2,
      },
      {
        name: 'Kitchen',
        slug: 'kitchen',
        accent_color: '#A855F7',
        icon: 'UtensilsCrossed',
        display_order: 3,
      },
      {
        name: 'Bathroom',
        slug: 'bathroom',
        accent_color: '#14B8A6',
        icon: 'Bath',
        display_order: 4,
      },
      {
        name: 'Home Office',
        slug: 'home_office',
        accent_color: '#10B981',
        icon: 'Briefcase',
        display_order: 5,
      },
      {
        name: 'Outdoor',
        slug: 'outdoor',
        accent_color: '#F59E0B',
        icon: 'Trees',
        display_order: 6,
      },
    ];

    const { data: insertedRooms } = await supabase
      .from('rooms')
      .insert(rooms)
      .select();

    if (!insertedRooms) return;

    const roomMap = insertedRooms.reduce(
      (acc, room) => {
        acc[room.slug] = room.id;
        return acc;
      },
      {} as Record<string, string>
    );

    const devices = [
      {
        room_id: roomMap.living_room,
        name: 'Smart Lights',
        type: 'lights',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.living_room,
        name: 'Smart TV',
        type: 'tv',
        status: { state: 'off', volume: 30, channel: '1' },
      },
      {
        room_id: roomMap.living_room,
        name: 'AC Unit',
        type: 'ac',
        status: { state: 'off', temperature: 22, mode: 'cool' },
      },
      {
        room_id: roomMap.living_room,
        name: 'Air Purifier',
        type: 'purifier',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.living_room,
        name: 'Window Blinds',
        type: 'blinds',
        status: { state: 'open', percentage: 100 },
      },
      {
        room_id: roomMap.living_room,
        name: 'Temperature Sensor',
        type: 'sensor',
        status: { temperature: 24, humidity: 55 },
        metadata: { read_only: true },
      },
      {
        room_id: roomMap.bedroom,
        name: 'Ceiling Lights',
        type: 'lights',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.bedroom,
        name: 'Bedside Lamp (Left)',
        type: 'lamp',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.bedroom,
        name: 'Bedside Lamp (Right)',
        type: 'lamp',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.bedroom,
        name: 'Smart Curtains',
        type: 'curtains',
        status: { state: 'closed', percentage: 0 },
      },
      {
        room_id: roomMap.bedroom,
        name: 'Fan',
        type: 'fan',
        status: { state: 'off', speed: 0 },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Overhead Lights',
        type: 'lights',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Under-cabinet Lights',
        type: 'lights',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Coffee Maker',
        type: 'coffee_maker',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Oven',
        type: 'oven',
        status: { state: 'off', temperature: 0 },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Refrigerator',
        type: 'refrigerator',
        status: { temperature: 4, door: 'closed' },
        metadata: { read_only: true },
      },
      {
        room_id: roomMap.kitchen,
        name: 'Dishwasher',
        type: 'dishwasher',
        status: { state: 'off', cycle: 'normal' },
      },
      {
        room_id: roomMap.bathroom,
        name: 'Main Lights',
        type: 'lights',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.bathroom,
        name: 'Mirror Lights',
        type: 'lights',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.bathroom,
        name: 'Exhaust Fan',
        type: 'exhaust_fan',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.bathroom,
        name: 'Water Heater',
        type: 'water_heater',
        status: { state: 'eco', temperature: 50 },
      },
      {
        room_id: roomMap.home_office,
        name: 'Desk Lamp',
        type: 'lamp',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.home_office,
        name: 'Overhead Lights',
        type: 'lights',
        status: { state: 'off', brightness: 0 },
      },
      {
        room_id: roomMap.home_office,
        name: 'PC',
        type: 'pc',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.outdoor,
        name: 'Garden Lights',
        type: 'lights',
        status: { state: 'off' },
      },
      {
        room_id: roomMap.outdoor,
        name: 'Porch Lights',
        type: 'lights',
        status: { state: 'auto' },
      },
      {
        room_id: roomMap.outdoor,
        name: 'Security Camera',
        type: 'camera',
        status: { state: 'armed', recording: true },
      },
      {
        room_id: roomMap.outdoor,
        name: 'Sprinkler System',
        type: 'sprinkler',
        status: { state: 'off', zone: 'all' },
      },
      {
        room_id: roomMap.outdoor,
        name: 'Gate',
        type: 'gate',
        status: { state: 'closed' },
      },
    ];

    await supabase.from('devices').insert(devices);

    const defaultScenes = [
      {
        name: 'Movie Night',
        description: 'Dim lights and prepare for movie watching',
        icon: 'Film',
        device_states: [],
        is_favorite: true,
      },
      {
        name: 'Good Morning',
        description: 'Wake up routine with lights and curtains',
        icon: 'Sunrise',
        device_states: [],
        is_favorite: true,
      },
      {
        name: 'Goodnight',
        description: 'Turn off lights and activate security',
        icon: 'Moon',
        device_states: [],
        is_favorite: true,
      },
      {
        name: 'Away Mode',
        description: 'Secure home when away',
        icon: 'Lock',
        device_states: [],
        is_favorite: false,
      },
    ];

    await supabase.from('scenes').insert(defaultScenes);
  },
};
