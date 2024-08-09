import { IsString, IsEmail, Matches } from 'class-validator';
import { PASSWORD_PATTERN } from '@src/utils/constants';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email',
    example: 'john-doe@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Securepass1234!!',
  })
  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password length should be 8 ~ 16, and must contain at least 1 letter, digit, and symbol.',
  })
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current user password',
    example: 'Securepass1234!!',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'New user password',
    example: 'NEWPassword1234!!',
  })
  @IsString()
  @Matches(PASSWORD_PATTERN, {
    message:
      'Password length should be 8 ~ 16, and must contain at least 1 letter, digit, and symbol.',
  })
  newPassword: string;
}

export class DeleteUserDto {
  @ApiProperty({
    description: 'User password',
    example: 'Securepass1234!!',
  })
  @IsString()
  password: string;
}

export class UpdateRefreshTokenDto {
  @IsString()
  refreshToken: string;
}
