import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import { JwtGuard } from './guards/jwt.guard';
import { LocalGuard } from './guards/local.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';

@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  strategy: 'exposeAll',
})
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @UseGuards(JwtGuard)
  @Get()
  authentication(@Req() req: RequestWithUser) {
    const user = req.user;
    return user;
  }

  @Post('register')
  async register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  @HttpCode(200)
  @UseGuards(LocalGuard)
  @Post('login')
  login(
    // @Body() user: LoginDto
    @Req() request: RequestWithUser, // taking user from request that return from validated function in local guard
    @Res({ passthrough: true }) response: Response, // if not set passthrough true, we will need to handle res our self and it'll throw serialize err
  ) {
    // return this.authService.getAuthenticatedUser(req.email, req.password);
    // rather call authService in here, we use guard instead and it'll do it for us
    const user = request.user;
    return this.authService.login(user, response, request);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Req() request: RequestWithUser, @Res() res: Response) {
    await this.authService.removeRefreshToken(request.user.id);
    this.authService.logout(res);
    return res.sendStatus(200);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  refresh(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      req.user.id,
      res,
    );
    res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }
}
