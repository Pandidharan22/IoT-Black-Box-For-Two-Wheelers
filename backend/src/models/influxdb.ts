import { Point, InfluxDB } from '@influxdata/influxdb-client';
import config from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('influxdb');

export class InfluxDBClient {
  private static instance: InfluxDBClient;
  private client: InfluxDB;
  private org: string;
  private bucket: string;

  private constructor() {
    this.client = new InfluxDB({
      url: config.INFLUXDB_URL,
      token: config.INFLUXDB_TOKEN,
    });
    this.org = config.INFLUXDB_ORG;
    this.bucket = config.INFLUXDB_BUCKET;
  }

  public static getInstance(): InfluxDBClient {
    if (!InfluxDBClient.instance) {
      InfluxDBClient.instance = new InfluxDBClient();
    }
    return InfluxDBClient.instance;
  }

  public async writePoint(point: Point): Promise<void> {
    const writeApi = this.client.getWriteApi(this.org, this.bucket);
    try {
      await writeApi.writePoint(point);
      await writeApi.close();
      logger.debug('Successfully wrote point to InfluxDB');
    } catch (error) {
      logger.error('Failed to write point to InfluxDB:', error);
      throw error;
    }
  }

  public async writePoints(points: Point[]): Promise<void> {
    const writeApi = this.client.getWriteApi(this.org, this.bucket);
    try {
      await writeApi.writePoints(points);
      await writeApi.close();
      logger.debug(`Successfully wrote ${points.length} points to InfluxDB`);
    } catch (error) {
      logger.error('Failed to write points to InfluxDB:', error);
      throw error;
    }
  }

  public getQueryApi() {
    return this.client.getQueryApi(this.org);
  }

  public async testConnection(): Promise<boolean> {
    try {
      const writeApi = this.client.getWriteApi(this.org, this.bucket);
      await writeApi.close();
      logger.info('Successfully connected to InfluxDB');
      return true;
    } catch (error) {
      logger.error('Failed to connect to InfluxDB:', error);
      return false;
    }
  }
}

// Example measurement schemas
export const MEASUREMENTS = {
  TELEMETRY: 'telemetry',
  BATTERY: 'battery',
  ACCELERATION: 'acceleration',
  GYROSCOPE: 'gyroscope',
};

// Example tag keys
export const TAGS = {
  DEVICE_ID: 'deviceId',
  EVENT_TYPE: 'eventType',
  SEVERITY: 'severity',
};

// Example field keys
export const FIELDS = {
  LATITUDE: 'latitude',
  LONGITUDE: 'longitude',
  SPEED: 'speed',
  HEADING: 'heading',
  BATTERY_LEVEL: 'batteryLevel',
  ACCURACY: 'accuracy',
  SATELLITES: 'satellites',
  X: 'x',
  Y: 'y',
  Z: 'z',
};

export default InfluxDBClient;