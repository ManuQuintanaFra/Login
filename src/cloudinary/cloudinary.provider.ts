import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config'; // Importa ConfigService

export const CloudinaryProvider = {
  provide: 'CLOUDINARY', // Un token de inyección
  useFactory: (configService: ConfigService) => { // Inyecta ConfigService
    return cloudinary.config({
      // Lee las credenciales desde las variables de entorno
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
    });
  },
  inject: [ConfigService], // Asegúrate de inyectar ConfigService
};