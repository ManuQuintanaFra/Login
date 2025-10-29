import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants'; // Importa las constantes

@Module({
  imports: [
    UsersModule,
    //JwtModule.register (síncrono)
    JwtModule.register({
      global: true, // Mantiene el módulo global
      secret: jwtConstants.secret, // Usa la constante directamente
      signOptions: { expiresIn: '60s' }, // Usa el valor hardcodeado directamente
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}