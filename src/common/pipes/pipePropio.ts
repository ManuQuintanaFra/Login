// src/common/pipes/no-spaces-validation.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class NoSpacesValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const fieldName = metadata.data || 'El valor';
    if (typeof value !== 'string') {
      throw new BadRequestException(`${fieldName} debe ser una cadena de texto.`);
    }
    if (/\s/.test(value)) {
      throw new BadRequestException(`${fieldName} no debe contener espacios.`);
    }
    return value;
  }
}