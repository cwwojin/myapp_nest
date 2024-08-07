import { IsString, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  originalUrl: string;
}

export class DeleteUrlDto {
  @IsString()
  shortUrl: string;
}
