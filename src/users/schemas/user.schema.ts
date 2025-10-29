// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; // Decoradores y fábrica de Mongoose para NestJS.
import { HydratedDocument } from 'mongoose'; // Tipo helper de Mongoose.

// Define el tipo para un documento Mongoose hidratado (un objeto con métodos de Mongoose).
export type UserDocument = HydratedDocument<User>;

// Decorador @Schema para marcar la clase como una definición de schema de Mongoose.
// { timestamps: true } añade automáticamente los campos createdAt y updatedAt.
@Schema({ timestamps: true })
export class User {
  // Mongoose añade automáticamente un campo _id de tipo ObjectId.

  // Decorador @Prop para definir una propiedad del schema.
  @Prop({
    required: true,  // El campo es obligatorio.
    unique: true,    // El valor debe ser único en la colección. Mongoose creará un índice único.
    index: true      // Crea un índice en este campo para optimizar búsquedas. (Redundante si unique=true, pero explícito).
  })
  username: string;

  @Prop({
    required: true,  // El hash de la contraseña es obligatorio.
    select: false    // IMPORTANTE: Evita que este campo se devuelva en las consultas por defecto.
                     // Hay que pedirlo explícitamente con .select('+passwordHash') cuando se necesite (ej. en el login).
  })
  passwordHash: string; // Almacena el hash de la contraseña, NUNCA la contraseña en texto plano.

  @Prop({
    type: String,     // Especifica explícitamente el tipo (aunque TypeScript lo infiere).
    required: false, // Este campo no es obligatorio al crear un usuario.
    default: null   // Valor por defecto si no se proporciona.
  })
  profilePictureUrl?: string | null; // URL de la imagen de perfil almacenada en Cloudinary. Puede ser string o null.

  // createdAt: Date; // Campo añadido automáticamente por { timestamps: true }
  // updatedAt: Date; // Campo añadido automáticamente por { timestamps: true }
}

// Crea el schema de Mongoose a partir de la clase User decorada.
export const UserSchema = SchemaFactory.createForClass(User);

// Aquí podrías añadir Hooks de Mongoose si fueran necesarios, por ejemplo,
// para realizar alguna acción antes o después de guardar ('save'), actualizar ('update'), etc.
// Ejemplo comentado en la versión original para hashear contraseña (aunque lo hacemos en el servicio).