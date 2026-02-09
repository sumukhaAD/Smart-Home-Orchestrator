import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { Room, Device } from '../types';
import { DeviceControl } from './DeviceControl';
import { useHomeStore } from '../store/homeStore';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const { devices } = useHomeStore();
  const roomDevices = devices.filter((d) => d.room_id === room.id);

  const IconComponent = (Icons as Record<string, React.FC<{ className?: string }>>)[
    room.icon
  ] || Icons.Home;

  const activeDevices = roomDevices.filter(
    (d) => d.status.state === 'on' || d.status.state === 'armed'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
    >
      <div
        className="p-4 border-b border-gray-700"
        style={{
          background: `linear-gradient(135deg, ${room.accent_color}15 0%, transparent 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ backgroundColor: room.accent_color + '20' }}
            >
              <IconComponent
                className="w-5 h-5"
                style={{ color: room.accent_color }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{room.name}</h3>
              <p className="text-xs text-gray-400">
                {activeDevices} of {roomDevices.length} active
              </p>
            </div>
          </div>

          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: room.accent_color + '20',
              color: room.accent_color,
            }}
          >
            {roomDevices.length} devices
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {roomDevices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No devices in this room
          </p>
        ) : (
          roomDevices.map((device) => (
            <DeviceControl
              key={device.id}
              device={device}
              accentColor={room.accent_color}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
