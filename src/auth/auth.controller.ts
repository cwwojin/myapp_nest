import { Controller, UseGuards, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '@src/auth/auth.service';
import { Request } from 'express';
import { JwtPayload, LocalLoginRequest } from './auth.interface';
import { UsersService } from '@src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: LocalLoginRequest) {
    return await this.authService.login(req.user.id);
  }

  @UseGuards(AuthGuard('jwt-refresh-token'))
  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const { id, refreshToken } = req.user as JwtPayload & { refreshToken };

    return await this.authService.checkRefreshToken(id, refreshToken);
  }
}
