import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common'; // Importa excepciones
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Importa CloudinaryService

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService, // Inyecta CloudinaryService
  ) {}

  async findOne(username: string): Promise<UserDocument | null> {
    // Excluye explícitamente el hash al buscar, aunque ya tenga select: false
    return this.userModel.findOne({ username }).select('+passwordHash').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido.');
    }
    const user = await this.userModel.findById(id).exec(); // No necesita select('+passwordHash') aquí
    if (!user) {
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Verifica si el usuario ya existe antes de intentar crear
    const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUser) {
        throw new BadRequestException('El nombre de usuario ya existe.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const createdUser = new this.userModel({
      username: createUserDto.username,
      passwordHash: hashedPassword,
    });

    try {
        const savedUser = await createdUser.save();
        // Usa desestructuración para excluir passwordHash
        const { passwordHash, ...userObject } = savedUser.toObject();
        return userObject as UserDocument; // Devuelve el objeto sin el hash
    } catch (error) {
        // ... (manejo de errores)
        if (error.code === 11000) {
           throw new BadRequestException('El nombre de usuario ya existe (error al guardar).');
        }
        console.error("Error al guardar usuario:", error);
        throw new InternalServerErrorException('Error al registrar el usuario.');
    }
  }

  // Método para actualizar la foto de perfil
  async updateProfilePicture(userId: string, file: Express.Multer.File): Promise<UserDocument> {
    const user = await this.findById(userId); // Verifica que el usuario existe

    // Sube el archivo a Cloudinary
    const uploadResult = await this.cloudinaryService.uploadFile(file).catch((error) => {
      console.error("Error Cloudinary:", error); // Loguea el error de Cloudinary
      throw new InternalServerErrorException(`Error al subir imagen: ${error.message}`);
    });

    // Actualiza el usuario con la nueva URL segura de Cloudinary
    user.profilePictureUrl = uploadResult.secure_url;

    try {
        const updatedUser = await user.save();
        // Usa desestructuración para excluir passwordHash
        const { passwordHash, ...userObject } = updatedUser.toObject();
        return userObject as UserDocument; // Devuelve el objeto sin el hash
    } catch (error) {
        // ... (manejo de errores)
        console.error("Error al actualizar usuario:", error);
        throw new InternalServerErrorException('Error al actualizar la foto de perfil.');
    }
  }
}