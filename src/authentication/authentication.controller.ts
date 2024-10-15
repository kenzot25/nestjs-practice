import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import { LocalGuard } from './guards/local.guard';
import RequestWithUser from './interfaces/requestWithUser.interface';
import { JwtGuard } from './guards/jwt.guard';
import User from 'src/user/user.entity';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Get()
  @UseGuards(JwtGuard)
  authentication(@Req() req: RequestWithUser) {
    const user = req.user;
    delete user.password;
    return user;
  }

  @Post('register')
  register(@Body() userData: RegisterDto) {
    return this.authService.register(userData);
  }

  @HttpCode(200)
  @Post('login')
  @UseGuards(LocalGuard)
  login(
    // @Body() user: LoginDto
    @Req() request: RequestWithUser, //local guard will passing user object into req
    @Res() response: Response,
  ) {
    // return this.authService.getAuthenticatedUser(req.email, req.password);
    // rather call authService in here, we use guard instead and it'll do it for us
    const user = request.user;
    return this.authService.login(user, response);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  logout(
    @Req() request: RequestWithUser, //local guard will passing user object into req
    @Res() res: Response,
  ) {
    this.authService.logout(res);
    return res.sendStatus(200);
  }
}
