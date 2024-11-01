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
import RequestWithUser from './interfaces/requestWithUser.interface';

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

  public async login(user: User, res: Response, request: RequestWithUser) {
    const accessTokenCookie = this.getCookieWithJwtAccessToken(user.id, res);
    const refreshTokenCookie = this.getCookieWithJwtRefreshToken(user.id, res);

    await this.userService.setCurrentRefreshToken(refreshTokenCookie, user.id);

    return user;
  }

  public async logout(res: Response) {
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
    return;
  }

  public getCookieWithJwtAccessToken(userId: number, res: Response) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}`,
    });
    res.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      maxAge: ms(
        this.configService.getOrThrow<string>(
          'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
        ),
      ),
    });
    return token;
  }

  public getCookieWithJwtRefreshToken(userId: number, res: Response) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}`,
    });
    res.cookie('Refresh', token, {
      secure: true,
      httpOnly: true,
      maxAge: ms(
        this.configService.getOrThrow<string>(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        ),
      ),
    });
    return token;
  }

  async removeRefreshToken(userId: number) {
    return this.userService.setCurrentRefreshToken(null, userId);
  }
}
