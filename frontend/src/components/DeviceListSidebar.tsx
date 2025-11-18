import React from 'react';
import type { DeviceWithLocation, DeviceStatus } from '../types/device';

interface DeviceListSidebarProps {
  devices: DeviceWithLocation[];
  selectedDeviceId: string | null;
  onDeviceSelect: (deviceId: string) => void;
}

const DeviceListSidebar: React.FC<DeviceListSidebarProps> = ({
  devices,
  selectedDeviceId,
  onDeviceSelect,
}) => {
  const getStatusColor = (status: DeviceStatus) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const onlineDevices = devices.filter(d => d.status === 'online');
  const offlineDevices = devices.filter(d => d.status !== 'online');

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <h2 className="text-lg font-semibold">Devices</h2>
        <div className="flex gap-4 mt-2 text-sm">
          <div>
            <span className="font-medium">{onlineDevices.length}</span> Online
          </div>
          <div>
            <span className="font-medium">{offlineDevices.length}</span> Offline
          </div>
        </div>
      </div>

      {/* Device List */}
      <div className="flex-1 overflow-y-auto">
        {devices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No devices registered</p>
          </div>
        ) : (
          <>
            {/* Online Devices */}
            {onlineDevices.length > 0 && (
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Online
                </h3>
                <div className="space-y-2">
                  {onlineDevices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => onDeviceSelect(device.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDeviceId === device.id
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)} animate-pulse`} />
                            <h4 className="font-medium text-sm truncate">{device.device_name}</h4>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 truncate">{device.device_id}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>🔋 {device.battery_level}%</span>
                            <span>⏱️ {formatTime(device.last_seen)}</span>
                          </div>
                          {device.location && device.location.speed !== undefined && (
                            <div className="mt-1 text-xs text-gray-600">
                              🚗 {device.location.speed.toFixed(1)} km/h
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Devices */}
            {offlineDevices.length > 0 && (
              <div className="p-3 border-t">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Offline / Idle
                </h3>
                <div className="space-y-2">
                  {offlineDevices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => onDeviceSelect(device.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedDeviceId === device.id
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(device.status)}`} />
                            <h4 className="font-medium text-sm truncate text-gray-700">{device.device_name}</h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">{device.device_id}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>🔋 {device.battery_level}%</span>
                            <span>⏱️ {formatTime(device.last_seen)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeviceListSidebar;
