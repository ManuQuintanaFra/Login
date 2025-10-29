import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common'; // Importa decoradores y interfaces necesarios.
import { DatabaseModule } from './database/database.module'; // Importa el módulo de configuración de la base de datos.
import { AuthModule } from './auth/auth.module'; // Importa el módulo de autenticación.
import { UsersModule } from './users/users.module'; // Importa el módulo de usuarios.
import { rateLimiterMiddleware } from './middlewares/rate-limiter.middleware'; // Importa el middleware de rate limiting personalizado.
import { AuthController } from './auth/auth.controller'; // Importa AuthController para aplicar middleware a rutas específicas.
import { ConfigModule } from '@nestjs/config'; // Importa el módulo de configuración para variables de entorno.
import { CloudinaryModule } from './cloudinary/cloudinary.module'; // Importa el módulo de Cloudinary.
import { LoggerMiddleware } from './middlewares/logger.middleware'; // Importa el middleware de logs personalizado.

@Module({
  imports: [
    // Configura ConfigModule para cargar variables desde el archivo .env.
    // isGlobal: true hace que ConfigService esté disponible en toda la aplicación
    // sin necesidad de importar ConfigModule en cada módulo individualmente.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Especifica que busque un archivo .env en la raíz.
    }),
    DatabaseModule, // Módulo para la conexión con MongoDB.
    AuthModule,     // Módulo para manejar la autenticación (login, JWT, guards).
    UsersModule,    // Módulo para gestionar usuarios (registro, perfiles).
    CloudinaryModule, // Módulo para interactuar con Cloudinary (subida de imágenes).
  ],
  controllers: [], // No hay controladores a nivel raíz de AppModule en este caso.
  providers: [],   // No hay providers a nivel raíz de AppModule en este caso.
})
// AppModule implementa NestModule para poder configurar middlewares.
export class AppModule implements NestModule {
  // El método 'configure' es requerido por NestModule. Se usa para aplicar middlewares.
  configure(consumer: MiddlewareConsumer) {
    // MiddlewareConsumer es un helper para configurar middlewares.
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
    consumer
      .apply(rateLimiterMiddleware) // Aplica el middleware importado.
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST }); // Aplica el middleware específicamente a la ruta POST /auth/login.
      // Esto asegura que el rate limiting solo afecte los intentos de inicio de sesión.
  }
}