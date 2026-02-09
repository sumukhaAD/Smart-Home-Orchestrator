export interface Room {
  id: string;
  name: string;
  slug: string;
  accent_color: string;
  icon: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeviceMetadata {
  temperature?: number;
  brightness?: number;
  volume?: number;
  percentage?: number;
  speed?: number;
  mode?: string;
  channel?: string;
  cycle?: string;
  height?: number;
  zone?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface DeviceStatus {
  state: string | number;
  [key: string]: string | number | boolean | DeviceMetadata | undefined;
}

export interface Device {
  id: string;
  room_id: string;
  name: string;
  type: string;
  status: DeviceStatus;
  metadata?: DeviceMetadata;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  device_id?: string;
  room_id?: string;
  action_type: string;
  previous_state?: DeviceStatus;
  new_state?: DeviceStatus;
  trigger: 'ai' | 'manual' | 'scheduled' | 'scene';
  command?: string;
  created_at: string;
}

export interface Scene {
  id: string;
  name: string;
  description: string;
  icon: string;
  device_states: Array<{
    device_id: string;
    status: DeviceStatus;
  }>;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Settings {
  id: string;
  key: string;
  value: {
    gemini_api_key?: string;
    scaledown_api_key?: string;
    theme?: 'dark' | 'light';
    voice_enabled?: boolean;
    compression_enabled?: boolean;
    notifications_enabled?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
  created_at?: string;
  updated_at?: string;
}

export interface AIAction {
  room: string;
  device: string;
  action: 'set' | 'toggle' | 'increase' | 'decrease';
  value: string | number | DeviceStatus;
}

export interface AIResponse {
  actions: AIAction[];
  confirmation: string;
  suggestions?: string[];
}

export interface TokenStats {
  original_tokens: number;
  compressed_tokens: number;
  tokens_saved: number;
  compression_ratio: number;
  session_tokens_saved: number;
}

export interface HomeState {
  rooms: Room[];
  devices: Device[];
  activityLogs: ActivityLog[];
  scenes: Scene[];
  settings: Settings[];
  securityMode: 'armed' | 'disarmed' | 'away';
  tokenStats: TokenStats;
  isLoading: boolean;
  error: string | null;
}

export type DeviceType =
  | 'lights'
  | 'tv'
  | 'ac'
  | 'purifier'
  | 'blinds'
  | 'curtains'
  | 'fan'
  | 'lamp'
  | 'coffee_maker'
  | 'oven'
  | 'refrigerator'
  | 'dishwasher'
  | 'faucet'
  | 'exhaust_fan'
  | 'shower'
  | 'water_heater'
  | 'desk'
  | 'pc'
  | 'camera'
  | 'sprinkler'
  | 'gate'
  | 'sensor';

export type RoomSlug =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'home_office'
  | 'outdoor';
