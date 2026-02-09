/*
  # Smart Home Orchestrator Database Schema

  ## Overview
  Complete database schema for Smart Home Orchestrator with rooms, devices, activity logs, scenes, and settings.

  ## New Tables
  1. rooms - Room information with display settings
  2. devices - Smart home devices with current states
  3. activity_logs - Device state changes and system activities
  4. scenes - User-defined presets
  5. settings - User preferences and API keys

  ## Security
  - RLS enabled on all tables
  - Public access policies for demo purposes
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  accent_color text NOT NULL DEFAULT '#3B82F6',
  icon text NOT NULL DEFAULT 'Home',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  status jsonb NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid REFERENCES devices(id) ON DELETE SET NULL,
  room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  trigger text NOT NULL DEFAULT 'manual',
  command text,
  created_at timestamptz DEFAULT now()
);

-- Create scenes table
CREATE TABLE IF NOT EXISTS scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text NOT NULL DEFAULT 'Sparkles',
  device_states jsonb NOT NULL DEFAULT '[]',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_devices_room_id ON devices(room_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_device_id ON activity_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create public access policies for demo
CREATE POLICY "Public access to rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to devices" ON devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to scenes" ON scenes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to settings" ON settings FOR ALL USING (true) WITH CHECK (true);