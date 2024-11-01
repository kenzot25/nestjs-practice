import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.Refresh,
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true, // need to set to true in order to use cookies in validate function
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken = request.cookies?.Refresh;
    return this.userService.getUserWhenRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );
  }
}
