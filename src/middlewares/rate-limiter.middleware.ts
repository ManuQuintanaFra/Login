// No usa @Injectable porque es un middleware funcional, no una clase NestMiddleware.
import { Request, Response, NextFunction } from 'express'; // Importa tipos de Express.
import rateLimit, { Options as RateLimitOptions } from 'express-rate-limit'; // Importa rate-limit y sus tipos.

// Define las opciones de configuración para el rate limiter.
const limiterOptions: Partial<RateLimitOptions> = {
  windowMs: 2 * 60 * 1000, // Ventana de tiempo: 2 minutos en milisegundos.
  limit: 5, // Límite: Bloquea después de 5 peticiones desde la misma IP en `windowMs`. Use `limit` instead of `max`.
  message: 'Demasiados intentos de login desde esta IP, por favor intente de nuevo después de 2 minutos', // Mensaje de error al bloquear.
  standardHeaders: 'draft-7', // Incluye headers estándar de rate limiting en la respuesta (RateLimit-*). 'draft-7' es el formato más reciente.
  legacyHeaders: false, // Deshabilita los headers antiguos (X-RateLimit-*).
  statusCode: 429, // Código de estado HTTP cuando se alcanza el límite (Too Many Requests).

  /**
   * Función para generar una clave única para cada cliente.
   * Usamos la IP del cliente como clave para el rate limiting.
   * Incluye fallbacks por si req.ip no está disponible (ej. detrás de proxies).
   */
  keyGenerator: (req: Request, res: Response): string => {
    // Intenta obtener la IP desde req.ip, req.socket.remoteAddress o el header x-forwarded-for.
    const ip = req.ip || req.socket?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown-ip';
    // Si x-forwarded-for devuelve un array (múltiples proxies), toma la primera IP.
    return Array.isArray(ip) ? ip[0] : ip;
  },

  /**
   * Handler que se ejecuta cuando un cliente excede el límite de peticiones.
   * Simplemente envía el código de estado y el mensaje definidos arriba.
   */
  handler: (req: Request, res: Response, next: NextFunction, optionsUsed: RateLimitOptions) => {
    // optionsUsed contiene las opciones efectivas aplicadas, incluyendo statusCode y message.
    res.status(optionsUsed.statusCode).send(optionsUsed.message);
  },
};

// Crea una instancia del middleware de express-rate-limit con las opciones definidas.
const loginRateLimiter = rateLimit(limiterOptions);

/**
 * Middleware funcional para NestJS.
 * Esta función simplemente llama al middleware de express-rate-limit (`loginRateLimiter`).
 * NestJS ejecutará esta función cuando se aplique en AppModule.
 */
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  loginRateLimiter(req, res, next);
}