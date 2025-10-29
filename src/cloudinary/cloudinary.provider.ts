// src/cloudinary/cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary'; // Importa el SDK v2 de Cloudinary.
import { ConfigService } from '@nestjs/config'; // Importa ConfigService para leer variables de entorno.

// Define un Provider personalizado de NestJS para la configuración de Cloudinary.
// Esto permite centralizar la configuración y usar inyección de dependencias (ConfigService).
export const CloudinaryProvider = {
  // Token de inyección: Es el nombre que usarás para inyectar la instancia configurada de Cloudinary.
  provide: 'CLOUDINARY',
  // `useFactory` permite crear el provider de forma dinámica, inyectando otros servicios.
  useFactory: (configService: ConfigService) => {
    // Configura el SDK de Cloudinary usando las credenciales leídas desde ConfigService.
    return cloudinary.config({
      // `getOrThrow` asegura que la aplicación falle al inicio si falta alguna variable de entorno esencial.
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  },
  // Especifica las dependencias que necesita `useFactory`. En este caso, ConfigService.
  inject: [ConfigService],
};