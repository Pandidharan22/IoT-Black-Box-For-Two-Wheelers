import { Request, Response, NextFunction } from 'express';import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';import jwt from 'jsonwebtoken';

import config from '../config';import config from '../config';

import { createLogger } from '../utils/logger';import { createLogger } from '../utils/logger';



const logger = createLogger('auth');const logger = createLogger('auth');



interface TokenPayload {interface TokenPayload {

  userId: string;  userId: string;

  role: string;  role: string;

}}



export interface AuthRequest extends Request {export interface AuthRequest extends Request {

  user?: TokenPayload;  user?: TokenPayload;

}}



export const authMiddleware = async (export const authMiddleware = async (

  req: AuthRequest,  req: AuthRequest,

  res: Response,  res: Response,

  next: NextFunction  next: NextFunction

) => {) => {

  try {  try {

    const authHeader = req.headers.authorization;    const authHeader = req.headers.authorization;



    if (!authHeader) {    if (!authHeader) {

      return res.status(401).json({      return res.status(401).json({

        error: 'Unauthorized',        error: 'Unauthorized',

        message: 'No authorization token provided'        message: 'No authorization token provided'

      });      });

    }    }



    // Extract token from Bearer scheme    // Extract token from Bearer scheme

    const token = authHeader.split(' ')[1];    const token = authHeader.split(' ')[1];

    if (!token) {    if (!token) {

      return res.status(401).json({      return res.status(401).json({

        error: 'Unauthorized',        error: 'Unauthorized',

        message: 'Invalid authorization header format'        message: 'Invalid authorization header format'

      });      });

    }    }



    try {    try {

      // Verify token      // Verify token

      const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;      const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

      req.user = decoded;      req.user = decoded;

      next();      next();

    } catch (error) {    } catch (error) {

      logger.error('Token verification failed:', error);      logger.error('Token verification failed:', error);

      return res.status(401).json({      return res.status(401).json({

        error: 'Unauthorized',        error: 'Unauthorized',

        message: 'Invalid or expired token'        message: 'Invalid or expired token'

      });      });

    }    }

  } catch (error) {  } catch (error) {

    logger.error('Authentication failed:', error);    logger.error('Auth middleware error:', error);

    return res.status(500).json({    return res.status(500).json({

      error: 'Internal Server Error',      error: 'Internal Server Error',

      message: 'Authentication process failed'      message: 'Authentication process failed'

    });    });

  }  }

};};