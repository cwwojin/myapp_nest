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
import { ApiBody, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: `Create a new user.`,
  })
  @ApiResponse({
    status: 201,
    description: 'success',
    schema: {
      type: 'object',
      properties: {
        pk: { type: 'number' },
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        password: { type: 'string', description: 'Bcrypt hash' },
        refreshToken: { type: 'string', description: 'Initial value : NULL' },
        profileImageFile: {
          type: 'string',
          description: 'File location in S3',
        },
        createdAt: { type: 'Date' },
        updatedAt: { type: 'Date' },
        deletedAt: { type: 'Date' },
      },
    },
  })
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.signUp(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get my account information.`,
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        profileImageFile: {
          type: 'string',
          description: 'File location in S3',
        },
      },
    },
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
  @ApiResponse({
    status: 200,
    description: 'success',
    schema: {
      type: 'array',
      properties: {
        pk: { type: 'number' },
        lastClickedTime: {
          type: 'Date',
          description: 'Timestamp of the latest click of this URL',
        },
      },
      example: [
        {
          pk: 1,
          lastClickedTime: 'TIMESTAMP',
        },
        1,
      ],
    },
  })
  @Get('url')
  async getMyUrls(@Req() req: IRequest) {
    return await this.usersService.getMyUrls(req.user.id);
  }

  @ApiOperation({
    summary: `Upload a user profile image.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'File',
          description: 'Uploaded Image File',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'success',
    schema: {
      type: 'string',
      description: 'File Location in S3',
      example: 'https://my-storage.s3.amazonaws.com/path/to/file.jpg',
    },
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
