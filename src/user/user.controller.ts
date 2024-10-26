import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Get,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/authentication/guards/jwt.guard';
import { Express, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import RequestWithUser from 'src/authentication/interfaces/requestWithUser.interface';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('avatar')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.userService.addAvatar(
      req.user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Delete('avatar')
  @UseGuards(JwtGuard)
  async deleteAvatar(@Req() req: RequestWithUser) {
    return this.userService.deleteAvatar(req.user.id);
  }

  @Post('privateFile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addPrivateFile(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.addPrivateFile(
      req.user.id,
      file.buffer,
      file.originalname,
    );
  }

  @Get('files/:id')
  @UseGuards(JwtGuard)
  async getPrivateFile(
    @Req() req: RequestWithUser,
    @Param('id') fileId: number,
    @Res() res: Response,
  ) {
    const file = await this.userService.getPrivateFile(
      req.user.id,
      Number(fileId),
    );
    file.stream.pipe(res);
  }

  @Get('files')
  @UseGuards(JwtGuard)
  async getAllPrivateFiles(@Req() req: RequestWithUser) {
    return this.userService.getAllPrivateFiles(req.user.id);
  }
}
