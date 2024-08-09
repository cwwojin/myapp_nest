import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  DeleteUserDto,
} from '@src/users/dto/users.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@src/@types/express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: `Create a new user.`,
  })
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get my account information.`,
  })
  @Get('myAccount')
  async getMyAccountInfo(@Req() req: IRequest) {
    return await this.usersService.getMyAccountInfo(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Update user password`,
  })
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
  @ApiOperation({
    summary: `Delete my user account`,
  })
  @Post('signout')
  async signOut(@Req() req: IRequest, @Body() deleteUserDto: DeleteUserDto) {
    return await this.usersService.signOut(req.user.id, deleteUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get all URLs saved by a user`,
  })
  @Get('url')
  async getMyUrls(@Req() req: IRequest) {
    return await this.usersService.getMyUrls(req.user.id);
  }

  @ApiOperation({
    summary: `Upload a user profile image.`,
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @Post('profile-img')
  async updateProfileImage(
    @Req() req: IRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.usersService.updateProfileImage(req.user.id, file);
  }

  @ApiOperation({
    summary: `Delete a user profile image`,
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('profile-img')
  async deleteProfileImage(@Req() req: IRequest) {
    return await this.usersService.deleteProfileImage(req.user.id);
  }
}
