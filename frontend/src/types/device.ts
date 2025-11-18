export type DeviceStatus = 'online' | 'offline' | 'idle' | 'error';

export interface Device {
  id: string;
  device_id: string;
  device_name: string;
  user_id?: string;
  firmware_version: string;
  last_seen: string;
  battery_level: number;
  status: DeviceStatus;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceLocation {
  deviceId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  satellites?: number;
}

export interface DeviceWithLocation extends Device {
  location?: DeviceLocation;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
