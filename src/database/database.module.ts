import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Importa el módulo de Mongoose para NestJS.
import { ConfigModule, ConfigService } from '@nestjs/config'; // Importa para leer la URL de la BD desde config

@Module({
  imports: [
    // Configura MongooseModule de forma asíncrona para poder inyectar ConfigService.
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Asegura que ConfigModule esté disponible aquí.
      useFactory: async (configService: ConfigService) => ({
        // Obtiene la URI de MongoDB desde las variables de entorno a través de ConfigService.
        // Es una mejor práctica que hardcodearla.
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        // Puedes añadir más opciones de conexión aquí si es necesario, ej:
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      }),
      inject: [ConfigService], // Inyecta ConfigService en useFactory.
    }),
  ],
  // Exporta MongooseModule para que otros módulos puedan usar forFeature.
  exports: [MongooseModule],
})
export class DatabaseModule {}