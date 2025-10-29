import {
  Controller, Post, Body, HttpCode, HttpStatus, BadRequestException,
  Param, UseInterceptors, UploadedFile, UseGuards, Request, Patch,
  NotFoundException, InternalServerErrorException // Asegúrate de importar todas las excepciones usadas.
} from '@nestjs/common';
import { UsersService } from './users.service'; // Servicio con la lógica de usuarios.
import { CreateUserDto } from './dto/create-user.dto'; // DTO para el cuerpo de registro.
import { NoSpacesValidationPipe } from '../common/pipes/pipePropio'; // Pipe personalizado para validar username.
import { FileInterceptor } from '@nestjs/platform-express'; // Interceptor de NestJS para manejar subida de archivos (usa Multer por debajo).
import { AuthGuard } from '../auth/auth.guard'; // Guard para proteger rutas y verificar JWT.
import type { Express } from 'express'; // Importa el *tipo* Express para tipar `req.user` y `file`.

@Controller('users') // Prefijo base para las rutas de este controlador: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Endpoint para registrar un nuevo usuario.
   * Ruta: POST /users/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Devuelve 201 Created en caso de éxito.
  async register(
    // Aplica el pipe NoSpacesValidationPipe solo al campo 'username' del body.
    @Body('username', NoSpacesValidationPipe) username: string,
    // El ValidationPipe global (en main.ts) valida el resto del DTO (ej. password minLength).
    @Body() createUserDto: CreateUserDto,
  ) {
     try {
       // Llama al servicio para crear el usuario.
       const user = await this.usersService.create(createUserDto);
       // El servicio ya se encarga de excluir el passwordHash.
       return user;
     } catch (error) {
         // Si el servicio lanzó una excepción conocida (BadRequest o InternalServer), la re-lanza.
         if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
             throw error;
         }
         // Captura cualquier otro error inesperado.
         console.error("Error en UsersController.register:", error);
         throw new InternalServerErrorException('Ocurrió un error inesperado durante el registro.');
     }
  }

  /**
   * Endpoint para subir/actualizar la foto de perfil del usuario autenticado.
   * Ruta: PATCH /users/profile-picture
   */
  @Patch('profile-picture') // PATCH es adecuado para actualizaciones parciales de un recurso.
  @UseGuards(AuthGuard) // Protege la ruta: solo usuarios autenticados (con JWT válido) pueden acceder.
  // Utiliza FileInterceptor para procesar un archivo subido en el campo 'profileImage'.
  // 'profileImage' es el nombre de la clave que se espera en la solicitud form-data.
  @UseInterceptors(FileInterceptor('profileImage'))
  async uploadProfilePicture(
    @Request() req, // Inyecta el objeto Request para acceder a req.user (poblado por AuthGuard).
    // @UploadedFile() extrae el archivo procesado por FileInterceptor.
    // `Express.Multer.File` es el tipo del objeto file proporcionado por Multer.
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validación básica: asegurarse de que se envió un archivo.
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo de imagen.');
    }
    // Podrías añadir un Pipe personalizado aquí a @UploadedFile() para validar
    // el tipo MIME (ej. solo jpeg/png) o el tamaño del archivo.

    // Obtiene el ID del usuario desde el payload del JWT (adjuntado por AuthGuard).
    // Asumimos que el payload contiene una propiedad `sub` con el ID.
    const userId = req.user?.sub; // Usamos optional chaining por seguridad.
    if (!userId) {
        // Esto no debería ocurrir si AuthGuard funciona, pero es una buena verificación.
        throw new BadRequestException('No se pudo identificar al usuario desde el token.');
    }

    try {
        // Llama al servicio para manejar la lógica de subida y actualización de la BD.
        const updatedUser = await this.usersService.updateProfilePicture(userId, file);
        // El servicio ya excluye el passwordHash.
        return updatedUser;
    } catch (error) {
        // Re-lanza excepciones conocidas del servicio.
        if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
            throw error;
        }
        // Captura errores inesperados.
        console.error("Error en UsersController.uploadProfilePicture:", error);
        throw new InternalServerErrorException('Ocurrió un error inesperado al subir la foto de perfil.');
    }
  }
}