import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // Importa el servicio de usuarios para buscar usuarios en la BD.
import { JwtService } from '@nestjs/jwt'; // Importa el servicio JWT para crear tokens.
import * as bcrypt from 'bcrypt'; // Importa bcrypt para comparar contraseñas hasheadas.

@Injectable() // Decorador que marca la clase como un Provider gestionado por NestJS.
export class AuthService {
  // Inyección de dependencias: NestJS inyecta instancias de UsersService y JwtService.
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida las credenciales de un usuario y devuelve un token JWT si son correctas.
   * @param username El nombre de usuario proporcionado.
   * @param pass La contraseña en texto plano proporcionada.
   * @returns Una promesa que resuelve a un objeto con el access_token.
   * @throws UnauthorizedException si las credenciales son inválidas.
   */
  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    // Busca al usuario por su nombre de usuario en la base de datos usando UsersService.
    // findOne ahora devuelve el hash porque lo seleccionamos explícitamente en el servicio
    const user = await this.usersService.findOne(username);

    // Verifica si el usuario existe y si la contraseña proporcionada coincide con el hash almacenado.
    // bcrypt.compare se encarga de comparar la contraseña plana con el hash de forma segura.
    // Es CRUCIAL usar `await` aquí porque bcrypt.compare es asíncrono.
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      // Si el usuario no existe o la contraseña no coincide, lanza una excepción 401 Unauthorized.
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si las credenciales son válidas, prepara el payload del token JWT.
    // El payload contiene información que se incluirá dentro del token.
    // 'sub' (subject) se usa comúnmente para el ID del usuario. Es importante que sea un string.
    // También incluimos el 'username' para poder acceder a él fácilmente desde el token decodificado.
    // NO INCLUYAS INFORMACIÓN SENSIBLE (como la contraseña) en el payload.
    const payload = { sub: user._id.toString(), username: user.username };

    // Firma el payload para crear el token JWT usando la clave secreta configurada en AuthModule.
    // jwtService.signAsync devuelve una promesa con el token firmado.
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}