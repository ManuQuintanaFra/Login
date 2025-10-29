import { NestFactory } from '@nestjs/core'; // Importa la fábrica principal de NestJS para crear la aplicación.
import { AppModule } from './app.module'; // Importa el módulo raíz de la aplicación.
import { ValidationPipe } from '@nestjs/common'; // Importa el ValidationPipe para validación automática de DTOs.
// Ya no se necesita rateLimit aquí, se aplica en AppModule.

async function bootstrap() {
  // Crea una instancia de la aplicación NestJS usando el módulo raíz (AppModule).
  const app = await NestFactory.create(AppModule);

  // Configura un pipe global para validación automática.
  // Cualquier DTO que use decoradores de class-validator en los controladores
  // será validado automáticamente antes de llegar al handler de la ruta.
  app.useGlobalPipes(new ValidationPipe());

  // Inicia la aplicación para que escuche en el puerto especificado por la variable de entorno PORT,
  // o en el puerto 3000 si no está definida.
  await app.listen(process.env.PORT ?? 3000);
}

// Llama a la función bootstrap para iniciar la aplicación.
bootstrap();