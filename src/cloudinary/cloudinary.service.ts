// src/cloudinary/cloudinary.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common'; // Importa Injectable y excepciones.
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary'; // Importa tipos y el SDK de Cloudinary.
import * as streamifier from 'streamifier'; // Importa streamifier para convertir buffer a stream.

// Define un tipo de unión para la respuesta de Cloudinary (puede ser éxito o error).
export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable() // Marca la clase como un servicio inyectable.
export class CloudinaryService {
  /**
   * Sube un archivo a Cloudinary.
   * @param file El archivo recibido (objeto Express.Multer.File que contiene el buffer).
   * @param folderName El nombre de la carpeta en Cloudinary donde se guardará (opcional).
   * @returns Una promesa que resuelve con la respuesta de Cloudinary (éxito o error).
   */
  uploadFile(file: Express.Multer.File, folderName: string = 'profile_pictures'): Promise<CloudinaryResponse> {
    // Retorna una nueva Promesa para manejar la naturaleza asíncrona del stream de subida.
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      // Inicia el stream de subida a Cloudinary usando `uploader.upload_stream`.
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName }, // Opciones de subida, como la carpeta destino.
        (error, result) => { // Callback que se ejecuta cuando la subida termina (o falla).
          if (error) {
            // Si hay un error en la subida, rechaza la promesa con el error.
            console.error('Cloudinary Upload Error:', error); // Loguea el error
            return reject(new InternalServerErrorException(`Error al subir a Cloudinary: ${error.message}`));
          }
          // Si no hay error, pero result es undefined (inesperado), rechaza.
          if (!result) {
            return reject(new InternalServerErrorException('Cloudinary no devolvió un resultado después de la subida.'));
          }
          // Si todo va bien, resuelve la promesa con el resultado de Cloudinary.
          resolve(result);
        },
      );

      // Multer nos da el archivo como un buffer. Cloudinary necesita un stream legible.
      // `streamifier.createReadStream` convierte el buffer en un stream.
      // Luego, hacemos `pipe` de ese stream al `uploadStream` de Cloudinary para enviar los datos.
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}