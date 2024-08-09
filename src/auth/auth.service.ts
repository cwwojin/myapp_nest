import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@src/users/entities';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.interface';
import { UsersService } from '@src/users/users.service';
import { UpdateRefreshTokenDto } from '@src/users/dto/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await User.createQueryBuilder('u')
      .where('u.email = :email', { email })
      .getOne();
    if (!user)
      throw new NotFoundException(`No User Found with email : ${email}`);

    const pwMatch = await user.comparePassword(password, user.password);
    if (pwMatch) {
      return user;
    } else {
      throw new BadRequestException(`Invalid Password.`);
    }
  }

  /* ====================================================== */
  /* START Local Services                                   */
  /* ====================================================== */

  async login(userId: string) {
    const accessToken = await this.getAccessToken(userId);
    const refreshToken = await this.getRefreshToken(userId);
    const updateRefreshTokenDto: UpdateRefreshTokenDto = { refreshToken };

    await this.usersService.updateRefreshToken(userId, updateRefreshTokenDto);

    return { accessToken, refreshToken };
  }

  /* ====================================================== */
  /* END Local Services                                     */
  /* ====================================================== */

  /* ====================================================== */
  /* START JWT Services                                     */
  /* ====================================================== */

  async getAccessToken(userId: string) {
    const payload: JwtPayload = { id: userId };
    const accessToken = await this.jwtService.signAsync(payload);

    return `Bearer ${accessToken}`;
  }

  async getRefreshToken(userId: string) {
    const payload: JwtPayload = { id: userId };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '14d',
    });

    return `Bearer ${refreshToken}`;
  }

  async checkRefreshToken(userId: string, refreshToken: string) {
    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();
    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const rtMatch = await user.compareRefreshToken(
      refreshToken,
      user.refreshToken,
    );
    if (rtMatch) {
      const newAccessToken = await this.getAccessToken(user.id);

      return { accessToken: newAccessToken };
    } else {
      throw new UnauthorizedException(`Invalid or Expired Refresh Token.`);
    }
  }

  /* ====================================================== */
  /* END JWT Services                                       */
  /* ====================================================== */
}
