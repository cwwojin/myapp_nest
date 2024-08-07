import {
  Controller,
  Get,
  Post,
  Patch,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  DeleteUserDto,
} from '@src/users/dto/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@src/@types/express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('myAccount')
  async getMyAccountInfo(@Req() req: IRequest) {
    return await this.usersService.getMyAccountInfo(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('password')
  async updatePassword(
    @Req() req: IRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return await this.usersService.updatePassword(
      req.user.id,
      updatePasswordDto,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('signout')
  async signOut(@Req() req: IRequest, @Body() deleteUserDto: DeleteUserDto) {
    return await this.usersService.signOut(req.user.id, deleteUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('url')
  async getMyUrls(@Req() req: IRequest) {
    return await this.usersService.getMyUrls(req.user.id);
  }
}
