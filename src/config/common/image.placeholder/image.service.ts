import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';

@Injectable()
export class ImageService {
  constructor(private readonly s3Service: S3Service) {}

  async getPlaceholder(key: string) {
    const body = await this.s3Service.findObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );

    return body as Readable;
  }

  async addPlaceholder(file: Express.Multer.File) {
    return await this.imageUrl(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      `image/placeholder`,
      file.originalname,
      file.mimetype,
      file.buffer,
    );
  }

  async imageUrl(
    buckectName: string,
    folderName: string,
    fileName: string,
    mimetype: string,
    file: Buffer,
  ) {
    const key = `${folderName}/${new Date().getTime()}-${fileName}`;

    Logger.verbose('Uploading photo for record...', 'Image');
    return await this.s3Service
      .uploadObjectToBucket(buckectName, key, file)
      .then(async () => {
        Logger.verbose('Record image upload successful', 'Image');
        return {
          url: `image/placeholder?&key=${encodeURIComponent(
            key,
          )}&mimetype=${mimetype}`,
          fileName: key,
        };
      });
  }

  async removePlaceholder(key: string) {
    Logger.verbose('Deleting photo for record...', 'Image');
    const deletedImage = await this.s3Service.deleteObjectFromBucket(
      process.env.S3_UMBARTHA_BUCKET_NAME,
      key,
    );
    Logger.verbose('Photo deleted for record', 'Image');
    return deletedImage;
  }
}
