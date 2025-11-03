import { Router } from 'express';
import TelemetryController from '../controllers/telemetry.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all telemetry routes
router.use(authMiddleware);

// Store telemetry data
router.post('/', TelemetryController.storeTelemetry);

// Get telemetry data for a device
router.get('/:deviceId', TelemetryController.getTelemetry);

// Get last known location of a device
router.get('/:deviceId/location', TelemetryController.getLastLocation);

export default router;