import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @ApiProperty({
    description: 'The original URL to save',
    example: 'www.google.com',
  })
  @IsUrl()
  originalUrl: string;
}

export class DeleteUrlDto {
  @IsString()
  shortUrl: string;
}
