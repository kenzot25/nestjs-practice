import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './entities/user.entity';
import { UserService } from './user.service';
import { FilesModule } from 'src/files/files.module';
import { UserController } from './user.controller';
import { PrivateFilesModule } from 'src/private-files/private-files.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FilesModule, PrivateFilesModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
