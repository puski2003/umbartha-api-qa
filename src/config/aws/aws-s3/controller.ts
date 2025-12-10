import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { S3Service } from './service';
import {
  BucketDto,
  ObjectDto,
  ObjectFromBuckectDto,
  PolicyToBucketDto,
} from './dto/s3.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('s3-client')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('object/:bucketName')
  async findAllObjects(@Param() buckect: BucketDto) {
    return this.s3Service.findAllObjectsFromBucket(buckect.bucketName);
  }

  @Get('object/:bucketName/object')
  async findOneObject(
    @Param() buckect: BucketDto,
    @Body() object: ObjectFromBuckectDto,
  ) {
    const buckectName = buckect.bucketName;
    const keyOfObj = object.keyOfObj;
    return this.s3Service.findObjectFromBucket(buckectName, keyOfObj);
  }

  @Get('object/:bucketName/object-url')
  async createObjectPublicUrl(
    @Param() buckect: BucketDto,
    @Body() object: ObjectFromBuckectDto,
  ) {
    const buckectName = buckect.bucketName;
    const keyOfObj = object.keyOfObj;
    return this.s3Service.createObjectPublicUrl({ buckectName, key: keyOfObj });
  }

  @Post('object')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() object: ObjectDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const key = `${object.folderName}/${encodeURIComponent(file.filename)}`;

    return await this.s3Service.uploadObjectToBucket(
      object.bucket,
      key,
      file.buffer,
    );
  }

  @Get('buckect')
  async findAllBuckets() {
    return this.s3Service.findAllBucket();
  }

  @Post('buckect/create')
  async createBuckect(@Body() buckect: BucketDto) {
    return await this.s3Service.createBucket(buckect.bucketName);
  }

  @Patch('buckect/policy/update')
  async addPolicyToBucket(@Body() buckect: PolicyToBucketDto) {
    return await this.s3Service.addPolicyToBucket(buckect);
  }

  @Delete('buckect/policy/delete')
  async deleteBuckectPolicy(@Body() buckect: BucketDto) {
    return await this.s3Service.deletePolicyFromBucket(buckect.bucketName);
  }

  @Delete('buckect/delete')
  async deleteBuckect(@Body() buckect: BucketDto) {
    return await this.s3Service.deleteEmplyBucket(buckect.bucketName);
  }
}
