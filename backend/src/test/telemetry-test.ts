import InfluxDBClient from '../models/influxdb';
import { TelemetryService } from '../services/telemetry.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('telemetry-test');

async function testTelemetrySetup() {
  try {
    // Test InfluxDB connection
    const influxClient = InfluxDBClient.getInstance();
    const isConnected = await influxClient.testConnection();
    
    if (!isConnected) {
      throw new Error('Failed to connect to InfluxDB');
    }
    logger.info('✅ Successfully connected to InfluxDB');

    // Initialize telemetry service
    const telemetryService = new TelemetryService();

    // Test data
    const testData = {
      deviceId: 'TEST-DEVICE-001',
      timestamp: new Date(),
      latitude: 13.0827,
      longitude: 80.2707,
      speed: 45.5,
      heading: 180.0,
      batteryLevel: 85.5,
      accuracy: 5.0,
      satellites: 8,
      accelerationX: 0.1,
      accelerationY: 0.2,
      accelerationZ: 9.8,
      gyroX: 0.01,
      gyroY: 0.02,
      gyroZ: 0.03
    };

    // Store test data
    logger.info('Storing test telemetry data...');
    await telemetryService.storeTelemetryData(testData);
    logger.info('✅ Successfully stored test telemetry data');

    // Query the stored data
    const startTime = new Date(testData.timestamp.getTime() - 1000); // 1 second before
    const endTime = new Date(testData.timestamp.getTime() + 1000); // 1 second after

    logger.info('Querying stored telemetry data...');
    const queryResult = await telemetryService.getDeviceTelemetry(
      testData.deviceId,
      startTime,
      endTime
    );

    if (queryResult.length === 0) {
      throw new Error('No telemetry data found');
    }
    logger.info('✅ Successfully retrieved telemetry data:', queryResult);

    // Test last known location
    logger.info('Getting last known location...');
    const location = await telemetryService.getLastKnownLocation(testData.deviceId);

    if (!location) {
      throw new Error('No location data found');
    }
    logger.info('✅ Successfully retrieved last known location:', location);

    logger.info('All tests passed successfully! ✅');
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testTelemetrySetup();