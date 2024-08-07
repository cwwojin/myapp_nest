import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsService {
  constructor(private readonly configService: ConfigService) {}

  /* ====================================================== */
  /* START S3 Services                                      */
  /* ====================================================== */

  /**
   * Upload a file to S3
   *
   * @param dataBuffer - Data Buffer
   * @param key - S3 Key
   * @returns The Location, S3 Key, File Size of the uploaded file.
   */
  async uploadFileToS3(dataBuffer: Buffer, key: string) {
    const client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      endpoint: this.configService.get('AWS_LOCATION'),
    });

    const parallelUploads3 = new Upload({
      client,
      params: {
        Bucket: this.configService.get('AWS_BUCKET_NAME'),
        Key: key,
        Body: dataBuffer,
      },
    });

    try {
      let fileSize = 0;
      parallelUploads3.on('httpUploadProgress', (response) => {
        fileSize = response.total;
      });

      const { Location, Key } = await parallelUploads3.done();

      return { fileSize, Location, Key };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Delete a File from S3
   *
   * @param key - S3 Key
   */
  async deleteFileFromS3(key: string) {
    const client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
      endpoint: this.configService.get('AWS_LOCATION'),
    });

    const command = new DeleteObjectCommand({
      Bucket: this.configService.get('AWS_BUCKET_NAME'),
      Key: key,
    });

    try {
      await client.send(command);
    } catch (e) {
      throw e;
    }
  }

  /* ====================================================== */
  /* END S3 Services                                        */
  /* ====================================================== */
}
