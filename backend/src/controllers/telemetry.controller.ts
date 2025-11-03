import { Request, Response } from 'express';
import telemetryService, { TelemetryData } from '../services/telemetry.service';
import { createLogger } from '../utils/logger';
import { z } from 'zod';

const logger = createLogger('telemetry-controller');

// Schema for validating telemetry data
const telemetrySchema = z.object({
  deviceId: z.string(),
  timestamp: z.string().optional().transform(str => str ? new Date(str) : undefined),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  batteryLevel: z.number().optional(),
  accuracy: z.number().optional(),
  satellites: z.number().int().optional(),
  accelerationX: z.number().optional(),
  accelerationY: z.number().optional(),
  accelerationZ: z.number().optional(),
  gyroX: z.number().optional(),
  gyroY: z.number().optional(),
  gyroZ: z.number().optional(),
});

// Schema for query parameters
const querySchema = z.object({
  start: z.string().transform(str => new Date(str)),
  end: z.string().optional().transform(str => str ? new Date(str) : new Date()),
  measurement: z.string().optional(),
});

export class TelemetryController {
  /**
   * Store telemetry data for a device
   */
  public static async storeTelemetry(req: Request, res: Response) {
    try {
      const data = telemetrySchema.parse(req.body);
      await telemetryService.storeTelemetryData(data);
      res.status(201).json({ message: 'Telemetry data stored successfully' });
    } catch (error) {
      logger.error('Failed to store telemetry data:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid telemetry data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to store telemetry data' });
    }
  }

  /**
   * Get telemetry data for a device within a time range
   */
  public static async getTelemetry(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const query = querySchema.parse(req.query);
      
      const data = await telemetryService.getDeviceTelemetry(
        deviceId,
        query.start,
        query.end,
        query.measurement
      );

      res.json(data);
    } catch (error) {
      logger.error('Failed to retrieve telemetry data:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to retrieve telemetry data' });
    }
  }

  /**
   * Get the last known location of a device
   */
  public static async getLastLocation(req: Request, res: Response) {
    try {
      const { deviceId } = req.params;
      const location = await telemetryService.getLastKnownLocation(deviceId);

      if (!location) {
        return res.status(404).json({ error: 'No location data found for device' });
      }

      res.json(location);
    } catch (error) {
      logger.error('Failed to retrieve last known location:', error);
      res.status(500).json({ error: 'Failed to retrieve last known location' });
    }
  }
}

export default TelemetryController;