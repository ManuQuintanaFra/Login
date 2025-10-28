import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Importa MongooseModule
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema'; // Importa el schema y la clase
import { UsersController } from './users.controller'; // Importa el controlador

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController], // Añade el controlador aquí
})
export class UsersModule {}