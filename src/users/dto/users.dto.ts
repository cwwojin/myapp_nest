import { IsString, IsEmail, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from '@src/utils/constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password length should be 8 ~ 16, and must contain at least 1 letter, digit, and symbol.',
  })
  password: string;
}

export class UpdatePasswordDto {
  @IsString()
  password: string;

  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password length should be 8 ~ 16, and must contain at least 1 letter, digit, and symbol.',
  })
  newPassword: string;
}

export class DeleteUserDto {
  @IsString()
  password: string;
}

export class UpdateRefreshTokenDto {
  @IsString()
  refreshToken: string;
}
