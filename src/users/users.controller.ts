import {
  Controller, Post, Body, HttpCode, HttpStatus, BadRequestException,
  Param, UseInterceptors, UploadedFile, UseGuards, Request, Patch, NotFoundException, InternalServerErrorException // Añade las excepciones
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { NoSpacesValidationPipe } from '../common/pipes/pipePropio';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
// Usa 'import type' para importar Express solo como un tipo
import type { Express } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('username', NoSpacesValidationPipe) username: string,
    @Body() createUserDto: CreateUserDto,
  ) {
     try {
       const user = await this.usersService.create(createUserDto);
       return user; // passwordHash ya se excluyó en el servicio
     } catch (error) {
         if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
             throw error;
         }
         console.error("Error en registro:", error);
         throw new InternalServerErrorException('Ocurrió un error inesperado durante el registro.');
     }
  }

  @Patch('profile-picture')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('profileImage'))
  async uploadProfilePicture(
    @Request() req,
    // Ahora TypeScript entiende que Express.Multer.File es solo un tipo
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo de imagen.');
    }

    const userId = req.user.sub;
    if (!userId) {
        throw new BadRequestException('No se pudo identificar al usuario desde el token.');
    }

    try {
        const updatedUser = await this.usersService.updateProfilePicture(userId, file);
        return updatedUser; // passwordHash ya se excluyó en el servicio
    } catch (error) {
        if (error instanceof BadRequestException || error instanceof NotFoundException || error instanceof InternalServerErrorException) {
            throw error;
        }
        console.error("Error al subir foto:", error);
        throw new InternalServerErrorException('Ocurrió un error inesperado al subir la foto de perfil.');
    }
  }
}