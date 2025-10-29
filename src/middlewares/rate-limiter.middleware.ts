import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Define las opciones una vez fuera para reutilizarlas y tiparlas
const limiterOptions = {
  windowMs: 2 * 60 * 1000, // 2 minutos
  max: 5, // Límite de 5 peticiones
  message: 'Demasiados intentos de login desde esta IP, por favor intente de nuevo después de 2 minutos',
  standardHeaders: 'draft-7' as const, // O true
  legacyHeaders: false,
  statusCode: 429,
  keyGenerator: (req: Request, res: Response): string => {
    const ip = req.ip || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown-ip';
    return Array.isArray(ip) ? ip[0] : ip;
  },
  handler: (req: Request, res: Response, next: NextFunction) => {
    // Aquí puedes usar directamente el statusCode y message definidos arriba
    res.status(limiterOptions.statusCode).send(limiterOptions.message);
  },
};

// Crea una instancia del middleware de express-rate-limit
const loginLimiter = rateLimit(limiterOptions);

// Exporta una función que NestJS puede usar como middleware funcional
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  // Ejecuta el middleware de express-rate-limit
  loginLimiter(req, res, next);
}