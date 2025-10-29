import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider'; // Importa el provider que configura Cloudinary.
import { CloudinaryService } from './cloudinary.service'; // Importa el servicio con la lógica de subida.
import { ConfigModule } from '@nestjs/config'; // Importa ConfigModule porque el Provider lo necesita.

@Module({
  // Importa ConfigModule aquí para asegurar que ConfigService esté disponible
  // para ser inyectado en el `useFactory` de CloudinaryProvider.
  imports: [ConfigModule],
  // Define los providers de este módulo.
  providers: [
    CloudinaryProvider, // El provider que usa ConfigService para configurar el SDK de Cloudinary.
    CloudinaryService   // El servicio que encapsula la lógica para subir archivos.
  ],
  // Exporta los providers para que puedan ser inyectados en otros módulos (como UsersModule).
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}