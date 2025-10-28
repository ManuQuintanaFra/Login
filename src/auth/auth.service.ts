import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Importa bcryptw

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username); // Busca el usuario en la BD

    // Verifica si el usuario existe y si la contraseña coincide con el hash almacenado
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) {
      throw new UnauthorizedException('Credenciales inválidas'); // Mensaje más específico
    }

    // El payload del JWT ahora usa el _id de MongoDB (convertido a string si es necesario) y el username
    const payload = { sub: user._id.toString(), username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}