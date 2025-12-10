import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteBucketPolicyCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { GetObjectI, PolicyToBucketI } from './types';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      region: `${process.env.REGION}`,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
  }

  async findAllObjectsFromBucket(bucketName: string) {
    const command = new ListObjectsV2Command({
      Bucket: `${bucketName}`,
      MaxKeys: 10,
    });

    try {
      let isTruncated = true;

      console.log('Your bucket contains the following objects:\n');
      let contents = '';
      let response;

      while (isTruncated) {
        response = await this.s3Client.send(command);
        const contentsList = response.Contents.map((c) => ` • ${c.Key}`).join(
          '\n',
        );
        contents += contentsList + '\n';
        isTruncated = response.IsTruncated;
        command.input.ContinuationToken = response.NextContinuationToken;
      }
      console.log(contents);
      return response;
    } catch (e) {
      console.error('Get list of object in a bucket failed', e);
      Logger.debug('GET LIST OF OBJECT IN A BUCKET FAILED');
      throw new BadRequestException(e);
    }
  }

  async findObjectFromBucket(buckectName: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: buckectName,
      Key: key,
    });

    try {
      const { Body } = await this.s3Client.send(command);
      return Body;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Photo is not found');
    }
  }

  async createObjectPublicUrl(object: GetObjectI) {
    const command = new GetObjectCommand({
      Bucket: `${object.buckectName}`,
      Key: `${object.key}`,
    });

    const url = await getSignedUrl(this.s3Client, command);
    return url;
  }

  async uploadObjectToBucket(buckectName: string, key: string, file: Buffer) {
    // return Buffer.from(file).toString('base64');

    // await this.findAllBucket().then(async (d) => {
    //   for (const buckect of d.Buckets) {
    //     if (buckectName === buckect.Name) {
    //       Logger.error('BUCKET IS FOUND');
    //       return;
    //     }
    //   }
    //   await this.createBucket(buckectName);
    // });

    const command = new PutObjectCommand({
      Bucket: buckectName,
      Key: key,
      Body: file,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Failed to upload image');
    }
  }

  async deleteObjectFromBucket(buckectName: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: buckectName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (err) {
      Logger.error('OBJECT DELETE FAILED');
      console.error(err);
    }
  }

  async findAllBucket() {
    const command = new ListBucketsCommand({});

    try {
      const response = await this.s3Client.send(command);
      Logger.debug(
        `${response.Owner.DisplayName} owns ${response.Buckets.length} bucket${
          response.Buckets.length === 1 ? '' : 's'
        }:`,
      );
      Logger.debug(`${response.Buckets.map((b) => ` • ${b.Name}`).join('\n')}`);
      return response;
    } catch (e) {
      console.error('List of bucket getting failed', e);
      Logger.error('LIST OF BUCKET GETTING FAILED');
      throw new BadRequestException(e);
    }
  }

  async createBucket(bucketName: string) {
    const command = new CreateBucketCommand({
      Bucket: `${bucketName}`,
    });

    try {
      const response = await this.s3Client.send(command);
      Logger.debug(`Bucket created with location ${response.Location}`);
      return response;
    } catch (e) {
      console.error('Bucket create failed', e);
      Logger.error('BUCKECT CREATE FAILED');
      throw new BadRequestException(e);
    }
  }

  async addPolicyToBucket(buckect: PolicyToBucketI) {
    const command = new PutBucketPolicyCommand({
      Policy: JSON.stringify(buckect.policy),
      Bucket: `${buckect.bucketName}`,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (e) {
      console.error('Policy add to bucket faild', e);
      Logger.debug('POLICY ADDING FAILED');
      throw new BadRequestException(e);
    }
  }

  async deletePolicyFromBucket(bucketName: string) {
    const command = new DeleteBucketPolicyCommand({
      Bucket: `${bucketName}`,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (e) {
      console.error('Bucket policy delete failed', e);
      Logger.error('BUCKECT POLICY DELETE FAILED');
      throw new BadRequestException(e);
    }
  }

  async deleteEmplyBucket(bucketName: string) {
    const command = new DeleteBucketCommand({
      Bucket: `${bucketName}`,
    });

    try {
      const response = await this.s3Client.send(command);
      return response;
    } catch (e) {
      console.error('Bucket delete failed', e);
      Logger.error('BUCKECT DELETE FAILED');
      throw new BadRequestException(e);
    }
  }
}
