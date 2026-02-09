import { motion } from 'framer-motion';
import { Clock, Zap, Hand, Calendar, Sparkles } from 'lucide-react';
import { useHomeStore } from '../store/homeStore';
import type { ActivityLog as ActivityLogType } from '../types';

export function ActivityLog() {
  const { activityLogs, devices, rooms } = useHomeStore();

  const getDeviceName = (deviceId?: string) => {
    if (!deviceId) return 'System';
    const device = devices.find((d) => d.id === deviceId);
    return device?.name || 'Unknown Device';
  };

  const getRoomName = (roomId?: string) => {
    if (!roomId) return '';
    const room = rooms.find((r) => r.id === roomId);
    return room?.name || '';
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'ai':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'manual':
        return <Hand className="w-4 h-4 text-blue-400" />;
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-green-400" />;
      case 'scene':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getActionDescription = (log: ActivityLogType) => {
    if (log.action_type === 'ai_command' && log.command) {
      return `AI: "${log.command}"`;
    }
    if (log.action_type === 'scene_applied' && log.command) {
      return log.command;
    }
    if (log.action_type === 'device_update') {
      const deviceName = getDeviceName(log.device_id);
      const roomName = getRoomName(log.room_id);
      const newState = log.new_state?.state || 'unknown';
      return `${deviceName} ${roomName ? `in ${roomName}` : ''} → ${newState}`;
    }
    return log.action_type.replace(/_/g, ' ');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Activity Log</h3>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {activityLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No activity yet</p>
            <p className="text-sm mt-1">Your smart home actions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {activityLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTriggerIcon(log.trigger)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {getActionDescription(log)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(log.created_at)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded capitalize whitespace-nowrap">
                    {log.trigger}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
