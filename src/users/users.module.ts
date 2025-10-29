import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Para interactuar con Mongoose.
import { UsersService } from './users.service'; // El servicio con la lógica de negocio de usuarios.
import { User, UserSchema } from './schemas/user.schema'; // El modelo y schema de Mongoose para usuarios.
import { UsersController } from './users.controller'; // El controlador para las rutas de usuarios.
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Importa CloudinaryModule para usar CloudinaryService.

@Module({
  imports: [
    // Registra el schema de User en Mongoose.
    // MongooseModule.forFeature hace que el `UserModel` (basado en `User.name` y `UserSchema`)
    // esté disponible para ser inyectado dentro de este módulo (específicamente en UsersService).
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // Importa CloudinaryModule para que UsersService pueda inyectar y usar CloudinaryService.
    CloudinaryModule,
  ],
  // Define los providers (servicios) de este módulo.
  providers: [UsersService],
  // Exporta UsersService para que otros módulos (como AuthModule) puedan inyectarlo y usarlo.
  exports: [UsersService],
  // Define los controladores de este módulo.
  controllers: [UsersController],
})
export class UsersModule {}