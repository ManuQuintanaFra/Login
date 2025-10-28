import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt'; // Importa bcrypt
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {} // Inyecta el modelo

  async findOne(username: string): Promise<UserDocument | null> {
    // Busca en la base de datos por nombre de usuario
    return this.userModel.findOne({ username: username }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const saltRounds = 10; // Factor de coste para bcrypt
    // Hashea la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const createdUser = new this.userModel({
      username: createUserDto.username,
      passwordHash: hashedPassword, // Guarda el hash
    });
    return createdUser.save();
  }
}