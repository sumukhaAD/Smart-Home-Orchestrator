import { motion } from 'framer-motion';
import {
  Power,
  Lightbulb,
  Tv,
  Wind,
  Fan,
  Coffee,
  Flame,
  Droplet,
  Camera,
  Sprout,
  Lock,
  Monitor,
  Bath,
} from 'lucide-react';
import type { Device, DeviceStatus } from '../types';
import { useHomeStore } from '../store/homeStore';
import { useState } from 'react';

interface DeviceControlProps {
  device: Device;
  accentColor: string;
}

export function DeviceControl({ device, accentColor }: DeviceControlProps) {
  const { updateDevice } = useHomeStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const getDeviceIcon = () => {
    switch (device.type) {
      case 'lights':
      case 'lamp':
        return <Lightbulb className="w-5 h-5" />;
      case 'tv':
        return <Tv className="w-5 h-5" />;
      case 'ac':
      case 'purifier':
        return <Wind className="w-5 h-5" />;
      case 'fan':
      case 'exhaust_fan':
        return <Fan className="w-5 h-5" />;
      case 'coffee_maker':
        return <Coffee className="w-5 h-5" />;
      case 'oven':
      case 'water_heater':
        return <Flame className="w-5 h-5" />;
      case 'faucet':
      case 'shower':
        return <Droplet className="w-5 h-5" />;
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'sprinkler':
        return <Sprout className="w-5 h-5" />;
      case 'gate':
        return <Lock className="w-5 h-5" />;
      case 'pc':
        return <Monitor className="w-5 h-5" />;
      case 'dishwasher':
        return <Bath className="w-5 h-5" />;
      default:
        return <Power className="w-5 h-5" />;
    }
  };

  const isOn = () => {
    const state = device.status.state;
    return state === 'on' || state === 'armed' || state === 'open';
  };

  const isReadOnly = device.metadata?.read_only === true;

  const handleToggle = async () => {
    if (isReadOnly || isUpdating) return;

    setIsUpdating(true);
    try {
      const currentState = device.status.state;
      let newState: string;

      if (device.type === 'blinds' || device.type === 'curtains') {
        newState = currentState === 'open' ? 'closed' : 'open';
      } else if (device.type === 'gate') {
        newState = currentState === 'open' ? 'closed' : 'open';
      } else if (device.type === 'camera') {
        newState = currentState === 'armed' ? 'disarmed' : 'armed';
      } else {
        newState = currentState === 'on' ? 'off' : 'on';
      }

      const newStatus: DeviceStatus = {
        ...device.status,
        state: newState,
      };

      if (newState === 'on' && device.type === 'lights' && newStatus.brightness !== undefined) {
        newStatus.brightness = newStatus.brightness || 80;
      }

      await updateDevice(device.id, newStatus, 'manual');
    } catch (error) {
      console.error('Failed to toggle device:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSliderChange = async (key: string, value: number) => {
    if (isReadOnly || isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus: DeviceStatus = {
        ...device.status,
        [key]: value,
      };

      if (key === 'brightness' && value > 0 && device.status.state === 'off') {
        newStatus.state = 'on';
      } else if (key === 'brightness' && value === 0) {
        newStatus.state = 'off';
      }

      await updateDevice(device.id, newStatus, 'manual');
    } catch (error) {
      console.error('Failed to update device:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderControls = () => {
    if (isReadOnly) {
      return (
        <div className="text-xs text-gray-500 mt-2">
          {device.status.temperature && `${device.status.temperature}°C`}
          {device.status.humidity && ` • ${device.status.humidity}%`}
          {device.status.door && ` • Door: ${device.status.door}`}
        </div>
      );
    }

    if (device.status.brightness !== undefined && device.type.includes('light')) {
      return (
        <div className="mt-2">
          <input
            type="range"
            min="0"
            max="100"
            value={Number(device.status.brightness) || 0}
            onChange={(e) => handleSliderChange('brightness', Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${device.status.brightness}%, #374151 ${device.status.brightness}%, #374151 100%)`,
            }}
            disabled={isUpdating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Off</span>
            <span>{device.status.brightness}%</span>
          </div>
        </div>
      );
    }

    if (device.status.temperature !== undefined && device.type === 'ac') {
      return (
        <div className="mt-2">
          <input
            type="range"
            min="16"
            max="30"
            value={Number(device.status.temperature) || 22}
            onChange={(e) => handleSliderChange('temperature', Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${((Number(device.status.temperature) - 16) / 14) * 100}%, #374151 ${((Number(device.status.temperature) - 16) / 14) * 100}%, #374151 100%)`,
            }}
            disabled={device.status.state === 'off' || isUpdating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>16°C</span>
            <span>{device.status.temperature}°C</span>
            <span>30°C</span>
          </div>
        </div>
      );
    }

    if (device.status.speed !== undefined && device.type === 'fan') {
      return (
        <div className="mt-2">
          <input
            type="range"
            min="0"
            max="100"
            value={Number(device.status.speed) || 0}
            onChange={(e) => handleSliderChange('speed', Number(e.target.value))}
            className="w-full h-1 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${accentColor} 0%, ${accentColor} ${device.status.speed}%, #374151 ${device.status.speed}%, #374151 100%)`,
            }}
            disabled={isUpdating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Off</span>
            <span>Speed: {device.status.speed}%</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border transition-all ${
        isOn()
          ? 'bg-gray-800/50 border-gray-700'
          : 'bg-gray-900/50 border-gray-800'
      } ${isUpdating ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg transition-colors ${
              isOn() ? 'bg-opacity-20' : 'bg-gray-800'
            }`}
            style={{ backgroundColor: isOn() ? accentColor + '33' : undefined }}
          >
            <div style={{ color: isOn() ? accentColor : '#9CA3AF' }}>
              {getDeviceIcon()}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">{device.name}</h4>
            <p className="text-xs text-gray-500 capitalize">
              {String(device.status.state)}
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isOn() ? 'bg-opacity-50' : 'bg-gray-700'
            }`}
            style={{ backgroundColor: isOn() ? accentColor : undefined }}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
              animate={{ left: isOn() ? '26px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        )}
      </div>

      {renderControls()}
    </motion.div>
  );
}
