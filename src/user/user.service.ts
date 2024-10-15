import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import UserEntity from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import CreateUserDto from './dto/createUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
}
