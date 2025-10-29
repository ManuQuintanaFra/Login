import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable() // Marca la clase como un Provider inyectable.
// Implementa la interfaz PipeTransform para actuar como un pipe de NestJS.
// <string, string> indica que espera un string y (si tiene éxito) devuelve un string.
export class NoSpacesValidationPipe implements PipeTransform<string, string> {
  /**
   * Método principal del pipe, se ejecuta automáticamente por NestJS.
   * @param value El valor del parámetro al que se aplica el pipe (en este caso, el username).
   * @param metadata Información sobre el parámetro (tipo, nombre si se aplica específicamente).
   * @returns El valor original si la validación pasa.
   * @throws BadRequestException si la validación falla (contiene espacios o no es string).
   */
  transform(value: unknown, metadata: ArgumentMetadata): string {
    // metadata.data contiene el nombre del parámetro si el pipe se aplica usando @Body('nombre', Pipe)
    const fieldName = metadata.data ? `'${metadata.data}'` : 'El valor';

    // 1. Validar que el tipo sea string
    if (typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} debe ser una cadena de texto.`);
    }

    // 2. Validar que no contenga espacios en blanco (\s es la regex para cualquier whitespace)
    if (/\s/.test(value)) {
      throw new BadRequestException(`${fieldName} no debe contener espacios.`);
    }

    // 3. Si ambas validaciones pasan, devuelve el valor sin modificar.
    return value;
  }
}