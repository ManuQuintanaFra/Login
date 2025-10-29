import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Importa CloudinaryModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CloudinaryModule, // Añade CloudinaryModule aquí
  ],
  providers: [UsersService],
  exports: [UsersService], // Exporta UsersService si AuthModule lo necesita
  controllers: [UsersController],
})
export class UsersModule {}