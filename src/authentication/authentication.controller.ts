import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import { LocalGuard } from './guards/local.guard';
import RequestWithUser from './requestWithUser.interface';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

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
  ) {
    // return this.authService.getAuthenticatedUser(req.email, req.password);
    // rather call authService in here, we use guard instead and it'll do it for us
    const user = request.user;
    delete user.password;
    return user;
  }
}
