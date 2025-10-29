import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// Habilita timestamps para tener createdAt y updatedAt automáticamente
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  username: string;

  @Prop({ required: true, select: false }) // Añade select: false para que no se devuelva por defecto
  passwordHash: string;

  @Prop({ type: String, required: false, default: null }) // Campo para la URL de la foto de perfil
  profilePictureUrl?: string | null; // Puede ser string o null

  // createdAt: Date; // Añadido automáticamente por timestamps: true
  // updatedAt: Date; // Añadido automáticamente por timestamps: true
}

export const UserSchema = SchemaFactory.createForClass(User);