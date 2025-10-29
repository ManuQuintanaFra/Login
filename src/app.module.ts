import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'; // Importa NestModule y MiddlewareConsumer
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { rateLimiterMiddleware } from './middlewares/rate-limiter.middleware'; // Importa tu middleware
import { AuthController } from './auth/auth.controller'; // Importa el controlador para vincular la ruta
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module'; // Asegúrate que esté importado

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Muy importante para que ConfigService esté disponible en CloudinaryProvider
      envFilePath: '.env', // Especifica el archivo .env
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CloudinaryModule, // Asegúrate de que esté importado aquí
  ],
  // ... resto del módulo
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(rateLimiterMiddleware)
      .forRoutes('auth/login');
  }
}