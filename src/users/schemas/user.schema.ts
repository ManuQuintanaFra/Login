import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  // Mongoose asigna un _id automáticamente, no es necesario definirlo aquí explícitamente a menos que quieras personalizarlo.

  @Prop({ required: true, unique: true, index: true }) // Asegura que el username sea único y crea un índice para búsquedas rápidas
  username: string;

  @Prop({ required: true })
  passwordHash: string; // Almacenaremos el hash de la contraseña, no la contraseña en texto plano
}

export const UserSchema = SchemaFactory.createForClass(User);

// Opcional: Hook para hashear la contraseña antes de guardar (si prefieres hacerlo aquí en lugar del servicio)
// import * as bcrypt from 'bcrypt';
// UserSchema.pre<UserDocument>('save', async function (next) {
//   if (this.isModified('passwordHash')) { // Solo hashear si la contraseña ha cambiado (o es nueva)
//     const saltRounds = 10; // Factor de coste para bcrypt
//     this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
//   }
//   next();
// });