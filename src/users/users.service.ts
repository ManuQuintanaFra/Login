// src/users/users.service.ts
import {
  Injectable,               // Decorador para servicios inyectables.
  NotFoundException,        // Excepción para cuando no se encuentra un recurso (404).
  BadRequestException,      // Excepción para solicitudes inválidas (400).
  InternalServerErrorException // Excepción para errores inesperados del servidor (500).
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose'; // Decorador para inyectar modelos de Mongoose.
import { Model, Types } from 'mongoose';      // Tipos de Mongoose (Model para interactuar, Types para ObjectId).
import * as bcrypt from 'bcrypt';            // Librería para hashear contraseñas.
import { User, UserDocument } from './schemas/user.schema'; // Importa el tipo y el documento Mongoose del usuario.
import { CreateUserDto } from './dto/create-user.dto';     // DTO para la creación de usuarios.
// Importa el servicio y el tipo de respuesta de Cloudinary.
import { CloudinaryService, CloudinaryResponse } from '../cloudinary/cloudinary.service';
// Importa el tipo específico de respuesta exitosa si necesitas hacer type guards más explícitos.
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class UsersService {
  // Inyecta el modelo de Mongoose 'User' y el servicio de Cloudinary via constructor.
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Busca un usuario por su nombre de usuario. Importante para el login.
   * @param username El nombre de usuario a buscar.
   * @returns El documento del usuario (incluyendo passwordHash) o null si no se encuentra.
   */
  async findOne(username: string): Promise<UserDocument | null> {
    // Busca un documento que coincida con el username.
    // .select('+passwordHash') es necesario porque en el schema (user.schema.ts)
    // definimos `passwordHash` con `select: false`. Esto lo oculta por defecto.
    // Para el proceso de login (en AuthService), SÍ necesitamos el hash para compararlo.
    return this.userModel.findOne({ username }).select('+passwordHash').exec();
  }

  /**
   * Busca un usuario por su ID de MongoDB (_id).
   * Útil para operaciones como actualizar o eliminar.
   * @param id El ID del usuario (como string).
   * @returns El documento del usuario encontrado.
   * @throws BadRequestException si el formato del ID es inválido.
   * @throws NotFoundException si no se encuentra un usuario con ese ID.
   */
  async findById(id: string): Promise<UserDocument> {
    // Antes de consultar la BD, verifica si el ID proporcionado tiene el formato válido de ObjectId.
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID de usuario inválido.');
    }
    // Busca el usuario por su _id. No incluye passwordHash por defecto (`select: false` en schema).
    const user = await this.userModel.findById(id).exec();
    // Si no se encuentra ningún usuario, lanza una excepción 404.
    if (!user) {
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    // Si se encuentra, devuelve el documento del usuario.
    return user;
  }

  /**
   * Crea un nuevo usuario en la base de datos. Usado en el registro.
   * @param createUserDto Datos del nuevo usuario (username, password).
   * @returns El documento del usuario recién creado, excluyendo el passwordHash.
   * @throws BadRequestException si el username ya está en uso.
   * @throws InternalServerErrorException si ocurre un error al guardar en la BD.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // 1. Verificar si el username ya existe para evitar errores de índice único más adelante.
    const existingUser = await this.userModel.findOne({ username: createUserDto.username }).exec();
    if (existingUser) {
        throw new BadRequestException('El nombre de usuario ya existe.');
    }

    // 2. Hashear la contraseña usando bcrypt.
    const saltRounds = 10; // Factor de coste (más alto = más seguro pero más lento). 10 es un buen balance.
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // 3. Crear una nueva instancia del modelo Mongoose.
    const createdUser = new this.userModel({
      username: createUserDto.username,
      passwordHash: hashedPassword, // Guardar el hash, NUNCA la contraseña original.
    });

    // 4. Intentar guardar el documento en MongoDB.
    try {
      const savedUser = await createdUser.save();
      // 5. Preparar la respuesta: Convertir a objeto plano y excluir el hash.
      // Usamos desestructuración: copiamos todas las propiedades EXCEPTO passwordHash a userObject.
      // Es preferible a `delete` porque TypeScript no se queja al quitar una propiedad no opcional.
      const { passwordHash, ...userObject } = savedUser.toObject();
      // Hacemos una aserción de tipo porque `userObject` ya no coincide exactamente con `UserDocument` (falta passwordHash),
      // pero para la respuesta del controlador está bien.
      return userObject as UserDocument;
    } catch (error) {
      // Manejar errores específicos de MongoDB, como violación de índice único (aunque ya lo chequeamos).
      if (error.code === 11000) {
          throw new BadRequestException('El nombre de usuario ya existe (error al guardar).');
      }
      // Loguear errores inesperados para depuración.
      console.error("Error al guardar usuario:", error);
      // Lanzar una excepción genérica 500.
      throw new InternalServerErrorException('Error al registrar el usuario.');
    }
  }

  /**
   * Sube una imagen de perfil a Cloudinary y actualiza la URL en el documento del usuario.
   * @param userId ID del usuario cuya foto se actualizará.
   * @param file Archivo de imagen subido (objeto Express.Multer.File).
   * @returns El documento del usuario actualizado, excluyendo el passwordHash.
   * @throws NotFoundException | BadRequestException si el usuario no existe o el ID es inválido.
   * @throws InternalServerErrorException si falla la subida a Cloudinary o la actualización en BD.
   */
  async updateProfilePicture(userId: string, file: Express.Multer.File): Promise<UserDocument> {
    // 1. Validar ID y encontrar al usuario (findById lanza excepciones si no es válido o no existe).
    const user = await this.findById(userId);

    // 2. Subir el archivo a Cloudinary.
    // Declaramos la variable para almacenar el resultado, usando el tipo unión que definimos.
    let uploadResult: CloudinaryResponse;
    try {
      // Llamamos al servicio de Cloudinary.
      uploadResult = await this.cloudinaryService.uploadFile(file);

      // 3. Verificar si Cloudinary devolvió una respuesta de error.
      // La propiedad 'error' solo existe en el tipo `UploadApiErrorResponse`.
      if ('error' in uploadResult) {
           console.error('Cloudinary Upload Error Details:', uploadResult.error);
           // Lanza una excepción si Cloudinary indica un error.
           throw new InternalServerErrorException(`Error de Cloudinary: ${uploadResult.error.message}`);
      }

      // Si no hay propiedad 'error', TypeScript infiere que uploadResult es de tipo `UploadApiResponse`.
      // 4. Actualizar la URL en el documento Mongoose del usuario. Usamos `secure_url` (HTTPS).
      user.profilePictureUrl = uploadResult.secure_url;

    } catch (error) {
      // Captura errores lanzados explícitamente (ej. por 'error' in uploadResult)
      // o errores de red/inesperados durante la llamada a cloudinaryService.uploadFile.
       console.error("Error al subir imagen (catch general):", error);
       // Si el error ya es una excepción HTTP conocida, la re-lanza tal cual.
       if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
           throw error;
       }
       // Si es otro tipo de error, lo envuelve en una InternalServerErrorException.
      throw new InternalServerErrorException(`Error inesperado al subir imagen: ${error.message || error}`);
    }

    // 5. Intentar guardar el documento actualizado en MongoDB.
    try {
      const updatedUser = await user.save();
      // 6. Preparar y devolver la respuesta sin el hash de contraseña.
      const { passwordHash, ...userObject } = updatedUser.toObject();
      return userObject as UserDocument;
    } catch (error) {
      // Manejar errores al guardar en la base de datos.
      console.error("Error al actualizar usuario en BD:", error);
      throw new InternalServerErrorException('Error al actualizar la foto de perfil en la base de datos.');
    }
  }
}