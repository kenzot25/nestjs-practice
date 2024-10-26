import { Module } from '@nestjs/common';
import { PrivateFilesService } from './private-files.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import PrivateFile from './private-files.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PrivateFilesService],
  imports: [TypeOrmModule.forFeature([PrivateFile]), ConfigModule],
  exports: [PrivateFilesService],
})
export class PrivateFilesModule {}
