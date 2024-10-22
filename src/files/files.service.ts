import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { S3 } from 'aws-sdk';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import PublicFile from './publicFiles.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(PublicFile)
    private readonly publicRepository: Repository<PublicFile>,
    private readonly configService: ConfigService,
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, filename: string) {
    const s3 = new S3();
    const uploadResult = await s3
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: `${uuid()}-${filename}`,
        Body: dataBuffer,
      })
      .promise();

    const newFile = this.publicRepository.create({
      key: uploadResult.Key,
      url: uploadResult.Location,
    });
    await this.publicRepository.save(newFile);
    return newFile;
  }

  async deletePublicFile(fileId: number) {
    try {
      const file = await this.publicRepository.findOne({
        where: {
          id: fileId,
        },
      });
      const s3 = new S3();
      const result = await s3
        .deleteObject({
          Bucket: this.configService.getOrThrow('AWS_PUBLIC_BUCKET_NAME'),
          Key: file.key,
        })
        .promise();

      await this.publicRepository.delete(file);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
