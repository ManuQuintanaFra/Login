import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable() // Necesario para inyectar dependencias si fuera el caso, y buena práctica.
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP'); // Crea un logger con el contexto 'HTTP'

  use(request: Request, response: Response, next: NextFunction): void {
    // Desestructura para obtener método, IP y URL original
    const { ip, method, originalUrl } = request;
    // Obtiene el user-agent del header
    const userAgent = request.get('user-agent') || '';

    // Registra el inicio de la petición ANTES de que se procese
    this.logger.log(
      `--> ${method} ${originalUrl} - ${userAgent} ${ip}`,
    );

    // Escucha el evento 'finish' en la respuesta para registrar DESPUÉS de que se envíe
    response.on('finish', () => {
      // Obtiene el código de estado y la longitud del contenido de la respuesta
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      // Registra el fin de la petición con el status code
      this.logger.log(
        `<-- ${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    // Llama a next() para pasar la petición al siguiente middleware o controlador.
    // Si no llamas a next(), la petición se quedará colgada aquí.
    next();
  }
}