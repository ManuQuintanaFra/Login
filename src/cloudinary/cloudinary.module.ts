import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';
import { ConfigModule } from '@nestjs/config'; // Importa ConfigModule

@Module({
  imports: [ConfigModule], // Importa ConfigModule para que el provider pueda usar ConfigService
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService], // Exporta el servicio para usarlo en otros módulos
})
export class CloudinaryModule {}