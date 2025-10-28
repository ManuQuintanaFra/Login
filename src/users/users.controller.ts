import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users') // Define la ruta base para este controlador
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register') // Endpoint POST /users/register
  @HttpCode(HttpStatus.CREATED) // Devuelve 201 Created si es exitoso
  async register(@Body() createUserDto: CreateUserDto) {
    // Llama al método create del servicio
    const user = await this.usersService.create(createUserDto);
    // Evita devolver la contraseña hasheada en la respuesta
    const { passwordHash, ...result } = user.toObject(); // O usa class-transformer para excluirla
    return result;
  }
}