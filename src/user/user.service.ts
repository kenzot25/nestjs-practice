import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import UserEntity from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './entities/user.entity';
import CreateUserDto from './dto/createUser.dto';
import PublicFile from 'src/files/publicFiles.entity';
import { FilesService } from 'src/files/files.service';
import { PrivateFilesService } from 'src/private-files/private-files.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly fileService: FilesService,
    private readonly privateFileService: PrivateFilesService,
  ) {}

  async getByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (user) return user;
    throw new HttpException(
      'User with this email does not exit',
      HttpStatus.NOT_FOUND,
    );
  }
  async getById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (user) return user;
    throw new HttpException(
      'User with id does not exits',
      HttpStatus.NOT_ACCEPTABLE,
    );
  }
  async createUser(userData: CreateUserDto) {
    const newUser = await this.userRepository.create(userData);
    await this.userRepository.save(newUser);
    return newUser;
  }

  async addAvatar(userId: number, imageBuffer: Buffer, fileName: string) {
    const avatar = await this.fileService.uploadPublicFile(
      imageBuffer,
      fileName,
    );
    const user = await this.getById(userId);
    await this.userRepository.update(userId, {
      ...user,
      avatar,
    });
    return avatar;
  }

  async deleteAvatar(userId: number) {
    const user = await this.getById(userId);

    const avatarId = user.avatar?.id;
    if (avatarId) {
      await this.userRepository.update(userId, {
        ...user,
        avatar: null,
      });
      await this.fileService.deletePublicFile(user.avatar?.id);
    }
  }

  async addPrivateFile(ownerId: number, file: Buffer, fileName: string) {
    return this.privateFileService.uploadPrivateFile(ownerId, file, fileName);
  }

  async getPrivateFile(userId: number, fileId: number) {
    const file = await this.privateFileService.getPrivateFile(fileId, userId);
    if (file) {
      return file;
    }
    throw new UnauthorizedException();
  }

  public async getAllPrivateFiles(userId: number) {
    const userWithFiles = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['files'],
    });
    if (userWithFiles) {
      return Promise.all(
        userWithFiles.files.map(async (file) => {
          const url = await this.privateFileService.generatePresignedUrl(
            file.key,
          );
          return {
            ...file,
            url,
          };
        }),
      );
    }
    throw new NotFoundException('User with id does not exist');
  }
}
