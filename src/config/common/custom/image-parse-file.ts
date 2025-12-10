import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isNotEmpty } from 'class-validator';

@Injectable()
export class ImageParseFilePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): Express.Multer.File {
    const file: Express.Multer.File = value;

    /**
     * Validate file type
     */
    const allowedTypes = [
      'image/apng',
      'image/avif',
      'image/gif',
      'image/jpeg',
      'image/png',
      'image/svg+xml',
      'image/webp',
      'image/bmp',
      'image/x-icon',
      'image/tiff',
    ];
    if (isNotEmpty(file?.mimetype) && !allowedTypes.includes(file?.mimetype))
      throw new BadRequestException('Unsupported file type');

    /**
     * validate file size (max 1MB)
     */
    const maxSize = 5 * 1024 * 1024;
    if (isNotEmpty(file?.size) && file.size > maxSize)
      throw new BadRequestException('File size exceeds the limit');

    return file;
  }
}
