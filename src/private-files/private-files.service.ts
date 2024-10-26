import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import PrivateFile from './private-files.entity';
import { Repository } from 'typeorm';
import User from 'src/user/entities/user.entity';
@Injectable()
export class PrivateFilesService {
  constructor(
    @InjectRepository(PrivateFile)
    private readonly privateFileRepository: Repository<PrivateFile>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPrivateFile(
    ownerId: number,
    dataBuffer: Buffer,
    filename: string,
  ) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
        Key: `${uuid()}-${filename}`,
        Body: dataBuffer,
      })
      .promise();

    const newFile = await this.privateFileRepository.create({
      key: uploadResult.Key,
      owner: {
        id: ownerId,
      },
    });
    await this.privateFileRepository.save(newFile);
    return newFile;
  }

  async getPrivateFile(fileId: number, userId: number) {
    const s3 = new S3();
    const fileInfo = await this.privateFileRepository.findOne({
      where: {
        id: fileId,
        owner: {
          id: userId,
        },
      },
      relations: ['owner'],
    });

    if (fileInfo) {
      const stream = await s3
        .getObject({
          Bucket: this.configService.get('AWS_PRIVATE_BUCKET_NAME'),
          Key: fileInfo.key,
        })
        .createReadStream();
      return {
        stream,
        info: fileInfo,
      };
    }
    throw new NotFoundException();
  }

  public async generatePresignedUrl(key: string) {
    const s3 = new S3();
    return s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
      Key: key,
    });
  }
}
