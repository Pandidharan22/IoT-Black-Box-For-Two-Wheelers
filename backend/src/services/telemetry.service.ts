import { Point, FluxTableMetaData } from '@influxdata/influxdb-client';
import InfluxDBClient, { MEASUREMENTS, TAGS } from '../models/influxdb';
import config from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('telemetry-service');

export interface TelemetryData {
  deviceId: string;
  timestamp?: Date;
  latitude?: number;
  longitude?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
  accuracy?: number;
  satellites?: number;
  accelerationX?: number;
  accelerationY?: number;
  accelerationZ?: number;
  gyroX?: number;
  gyroY?: number;
  gyroZ?: number;
}

export class TelemetryService {
  private client: InfluxDBClient;

  constructor() {
    this.client = InfluxDBClient.getInstance();
  }

  public async storeTelemetryData(data: TelemetryData): Promise<void> {
    const timestamp = data.timestamp || new Date();
    const points: Point[] = [];

    // GPS and Speed data
    if (data.latitude !== undefined && data.longitude !== undefined) {
      const locationPoint = new Point(MEASUREMENTS.TELEMETRY)
        .tag(TAGS.DEVICE_ID, data.deviceId)
        .floatField('latitude', data.latitude)
        .floatField('longitude', data.longitude)
        .timestamp(timestamp);

      if (data.speed !== undefined) {
        locationPoint.floatField('speed', data.speed);
      }
      if (data.heading !== undefined) {
        locationPoint.floatField('heading', data.heading);
      }
      if (data.accuracy !== undefined) {
        locationPoint.floatField('accuracy', data.accuracy);
      }
      if (data.satellites !== undefined) {
        locationPoint.intField('satellites', data.satellites);
      }

      points.push(locationPoint);
    }

    // Battery data
    if (data.batteryLevel !== undefined) {
      points.push(
        new Point(MEASUREMENTS.BATTERY)
          .tag(TAGS.DEVICE_ID, data.deviceId)
          .floatField('level', data.batteryLevel)
          .timestamp(timestamp)
      );
    }

    // Acceleration data
    if (data.accelerationX !== undefined || 
        data.accelerationY !== undefined || 
        data.accelerationZ !== undefined) {
      const accPoint = new Point(MEASUREMENTS.ACCELERATION)
        .tag(TAGS.DEVICE_ID, data.deviceId)
        .timestamp(timestamp);

      if (data.accelerationX !== undefined) {
        accPoint.floatField('x', data.accelerationX);
      }
      if (data.accelerationY !== undefined) {
        accPoint.floatField('y', data.accelerationY);
      }
      if (data.accelerationZ !== undefined) {
        accPoint.floatField('z', data.accelerationZ);
      }

      points.push(accPoint);
    }

    // Gyroscope data
    if (data.gyroX !== undefined || 
        data.gyroY !== undefined || 
        data.gyroZ !== undefined) {
      const gyroPoint = new Point(MEASUREMENTS.GYROSCOPE)
        .tag(TAGS.DEVICE_ID, data.deviceId)
        .timestamp(timestamp);

      if (data.gyroX !== undefined) {
        gyroPoint.floatField('x', data.gyroX);
      }
      if (data.gyroY !== undefined) {
        gyroPoint.floatField('y', data.gyroY);
      }
      if (data.gyroZ !== undefined) {
        gyroPoint.floatField('z', data.gyroZ);
      }

      points.push(gyroPoint);
    }

    if (points.length > 0) {
      await this.client.writePoints(points);
      logger.debug('Stored telemetry data for device', { 
        deviceId: data.deviceId, 
        measurements: points.length 
      });
    }
  }

  public async getDeviceTelemetry(
    deviceId: string,
    start: Date,
    end: Date = new Date(),
    measurement: string = MEASUREMENTS.TELEMETRY
  ) {
    const queryApi = this.client.getQueryApi();
    const query = `
      from(bucket: "${config.INFLUXDB_BUCKET}")
        |> range(start: ${start.toISOString()}, stop: ${end.toISOString()})
        |> filter(fn: (r) => r["_measurement"] == "${measurement}")
        |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
    `;

    try {
      const data: Record<string, any>[] = [];
      const result = await queryApi.collectRows(query, (row: string[], tableMeta: FluxTableMetaData) => {
        const o: Record<string, any> = {};
        for (let i = 0; i < tableMeta.columns.length; i++) {
          const column = tableMeta.columns[i];
          // Skip internal InfluxDB columns
          if (!column.label.startsWith('_')) {
            o[column.label] = row[i];
          }
          // Include timestamp
          if (column.label === '_time') {
            o.timestamp = row[i];
          }
        }
        return o;
      });
      logger.debug('Retrieved telemetry data', { 
        deviceId, 
        measurement, 
        count: result.length 
      });
      return result;
    } catch (error) {
      logger.error('Failed to query telemetry data:', error);
      throw error;
    }
  }

  public async getLastKnownLocation(deviceId: string): Promise<TelemetryData | null> {
    const queryApi = this.client.getQueryApi();
    const query = `
      from(bucket: "${config.INFLUXDB_BUCKET}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "${MEASUREMENTS.TELEMETRY}")
        |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> group()
        |> sort(columns: ["_time"], desc: true)
        |> limit(n:1)
    `;

    try {
      const result = await queryApi.collectRows(query);
      if (result.length === 0) return null;

      const lastRow = result[0] as Record<string, any>;
      const telemetry: Partial<TelemetryData> = {
        deviceId,
        timestamp: new Date(lastRow._time),
        latitude: lastRow.latitude,
        longitude: lastRow.longitude,
        speed: lastRow.speed,
        heading: lastRow.heading,
        accuracy: lastRow.accuracy,
        satellites: lastRow.satellites
      };

      return telemetry as TelemetryData;
    } catch (error) {
      logger.error('Failed to get last known location:', error);
      throw error;
    }
  }
}

export default new TelemetryService();