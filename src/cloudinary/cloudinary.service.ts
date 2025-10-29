import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

// Define un tipo para el resultado esperado (éxito o error)
export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File, folderName: string = 'profile_pictures'): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName }, // Sube a una carpeta específica
        (error, result) => {
          if (error) return reject(error);
          // Asegúrate de que result no sea undefined antes de resolver
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary no devolvió un resultado.'));
          }
        },
      );
      // Crea un stream desde el buffer del archivo y lo pipea a Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}