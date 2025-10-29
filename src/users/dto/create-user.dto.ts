// src/users/dto/create-user.dto.ts
// DTO (Data Transfer Object) para validar los datos de entrada al crear un usuario.
// Utiliza decoradores de la librería class-validator.

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  // @IsNotEmpty(): Asegura que el campo no sea null, undefined o una cadena vacía.
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  // @IsString(): Asegura que el valor sea una cadena de texto.
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  username: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  // @MinLength(): Asegura que la cadena tenga al menos 6 caracteres.
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  // No incluimos passwordHash aquí porque se genera en el servicio.
  // No incluimos profilePictureUrl porque se establece después.
}

// Este DTO será validado automáticamente por el ValidationPipe global
// cuando se use como tipo en un decorador @Body() en el controlador.