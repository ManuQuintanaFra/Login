import {
  Body,               // Decorador para extraer el cuerpo completo de la solicitud.
  Controller,         // Decorador para definir una clase como controlador.
  Get,                // Decorador para definir un handler para peticiones GET.
  HttpCode,           // Decorador para establecer el código de estado HTTP por defecto de la respuesta.
  HttpStatus,         // Enumeración con códigos de estado HTTP estándar.
  Post,               // Decorador para definir un handler para peticiones POST.
  Request,            // Decorador para inyectar el objeto Request de Express.
  UseGuards           // Decorador para aplicar Guards a un handler o controlador.
} from '@nestjs/common';
import { AuthGuard } from './auth.guard'; // Importa el Guard de autenticación personalizado.
import { AuthService } from './auth.service'; // Importa el servicio de autenticación.

@Controller('auth') // Define el prefijo de ruta base para todos los handlers en este controlador (ej. /auth/login).
export class AuthController {
  // Inyecta AuthService para usar sus métodos.
  constructor(private authService: AuthService) {}

  /**
   * Endpoint para iniciar sesión.
   * Recibe username y password en el cuerpo de la solicitud.
   * Devuelve un token JWT si las credenciales son válidas.
   * Ruta: POST /auth/login
   */
  @HttpCode(HttpStatus.OK) // Establece que la respuesta exitosa por defecto sea 200 OK (en lugar de 201 para POST).
  @Post('login') // Define este método como handler para POST /auth/login.
  // @Body() extrae el cuerpo completo de la solicitud (espera un JSON con username y password).
  // signInDto: Record<string, any> es una forma genérica de tipar el DTO, podrías crear un DTO específico (LoginDto).
  signIn(@Body() signInDto: Record<string, any>) {
    // Llama al método signIn del AuthService, pasando el username y password recibidos.
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  /**
   * Endpoint protegido para obtener el perfil del usuario autenticado.
   * Requiere un token JWT válido en el header Authorization: Bearer <token>.
   * Ruta: GET /auth/profile
   */
  @UseGuards(AuthGuard) // Aplica el AuthGuard a este endpoint. AuthGuard verificará el JWT.
  @Get('profile') // Define este método como handler para GET /auth/profile.
  // @Request() inyecta el objeto Request de Express.
  // El AuthGuard (si tiene éxito) habrá añadido la información del payload del JWT a req.user.
  getProfile(@Request() req) {
    // Devuelve la información del usuario que el AuthGuard adjuntó al objeto request.
    return req.user;
  }
}