import { Controller, UseGuards, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@src/auth/auth.service';
import { Request } from 'express';
import { JwtPayload, LocalLoginRequest } from './auth.interface';
import { UsersService } from '@src/users/users.service';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: `Login user.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User Email',
          example: 'john-doe@gmail.com',
        },
        password: {
          type: 'string',
          description: 'User password',
          example: 'Securepass1234!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'success',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Access Token in Bearer Format',
          example: 'Bearer <JWT_TOKEN>',
        },
        refreshToken: {
          type: 'string',
          description: 'Refresh Token in Bearer Format',
          example: 'Bearer <JWT_TOKEN>',
        },
      },
    },
  })
  @Post('login')
  async login(@Req() req: LocalLoginRequest) {
    return await this.authService.login(req.user.id);
  }

  @UseGuards(AuthGuard('jwt-refresh-token'))
  @ApiOperation({
    summary: `Get a new access token using a refresh token.`,
  })
  @ApiResponse({
    status: 201,
    description: 'success',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Access Token in Bearer Format',
          example: 'Bearer <JWT_TOKEN>',
        },
      },
    },
  })
  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const { id, refreshToken } = req.user as JwtPayload & { refreshToken };

    return await this.authService.checkRefreshToken(id, refreshToken);
  }
}
