import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import ms from 'ms';
import User from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import RegisterDto from './dto/register.dto';
import { PostgresErrorCode } from 'src/database/postgresErrorCodes.enum';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async register(registerData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerData.password, 10);
    try {
      const createdUser = await this.userService.createUser({
        ...registerData,
        password: hashedPassword,
      });
      return createdUser;
    } catch (err) {
      if (err?.code == PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exits',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userService.getByEmail(email);
      await this.verifyPassword(plainTextPassword, user.password);
      return user;
    } catch (err) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }
  }
  private async verifyPassword(
    plainTextPassword: string,
    hashPassword: string,
  ) {
    const isMatched = await bcrypt.compare(plainTextPassword, hashPassword);
    if (!isMatched) {
      throw new HttpException('Wrong credentials', HttpStatus.BAD_REQUEST);
    }
  }

  public login(user: User, res: Response) {
    const expires = new Date();
    expires.setMilliseconds(
      expires.getMilliseconds() +
        ms(this.configService.getOrThrow<string>('JWT_EXPIRATION_TIME')),
    );
    const payload: TokenPayload = { userId: user.id };
    const token = this.jwtService.sign(payload);
    res.cookie('Authentication', token, {
      // secure: true,
      secure: false, // temporary set to false due to thunder client behavior
      httpOnly: true,
      expires: expires,
    });
    return user;
  }

  public async logout(res: Response) {
    res.clearCookie('Authentication');
    return;
  }
}
