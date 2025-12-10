import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isEmpty, isNotEmpty } from 'class-validator';

@Injectable()
export class TemplateParseFilePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): Express.Multer.File {
    const file: Express.Multer.File = value;

    if (isEmpty(file)) throw new BadRequestException('the file in not found');

    /**
     * Validate file type
     */
    const allowedTypes = ['text/plain', 'text/html'];
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
