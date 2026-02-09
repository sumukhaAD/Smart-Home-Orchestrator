import { Home, Settings, Shield, ShieldOff, Lock } from 'lucide-react';
import { useHomeStore } from '../store/homeStore';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  const { securityMode, setSecurityMode, devices, rooms } = useHomeStore();

  const activeDevices = devices.filter(
    (d) => d.status.state === 'on' || d.status.state === 'armed'
  ).length;

  const getSecurityIcon = () => {
    switch (securityMode) {
      case 'armed':
        return <Shield className="w-5 h-5 text-green-400" />;
      case 'away':
        return <Lock className="w-5 h-5 text-amber-400" />;
      default:
        return <ShieldOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const cycleSecurityMode = () => {
    const modes: Array<'armed' | 'disarmed' | 'away'> = ['disarmed', 'armed', 'away'];
    const currentIndex = modes.indexOf(securityMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setSecurityMode(nextMode);
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Smart Home</h1>
              <p className="text-xs text-gray-400">AI Orchestrator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-gray-800 rounded-lg">
              <div className="text-right">
                <p className="text-xs text-gray-400">Active</p>
                <p className="text-sm font-semibold text-white">{activeDevices}</p>
              </div>
              <div className="w-px h-8 bg-gray-700" />
              <div className="text-right">
                <p className="text-xs text-gray-400">Rooms</p>
                <p className="text-sm font-semibold text-white">{rooms.length}</p>
              </div>
            </div>

            <button
              onClick={cycleSecurityMode}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title={`Security: ${securityMode}`}
            >
              {getSecurityIcon()}
              <span className="text-sm text-gray-300 capitalize">{securityMode}</span>
            </button>

            <button
              onClick={onSettingsClick}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
