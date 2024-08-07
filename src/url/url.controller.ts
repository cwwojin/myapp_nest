import {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto, DeleteUrlDto } from './dto/url.dto';
import { AuthGuard } from '@nestjs/passport';
import { IRequest } from '@src/@types/express';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('new')
  async generateShortUrl(
    @Req() req: IRequest,
    @Body() createUrlDto: CreateUrlDto,
  ) {
    return await this.urlService.generateShortUrl(req.user.id, createUrlDto);
  }

  @Get('get/:shortUrl')
  async getOriginalUrl(@Param('shortUrl') shortUrl: string) {
    return await this.urlService.getOriginalUrl(shortUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':shortUrl')
  async deleteShortUrl(
    @Req() req: IRequest,
    @Param('shortUrl') shortUrl: string,
  ) {
    const deleteUrlDto: DeleteUrlDto = { shortUrl: shortUrl };

    return await this.urlService.deleteShortUrl(req.user.id, deleteUrlDto);
  }

  @Get('inspect/:urlId')
  async getUrlMeta(@Param('urlId') urlId: number) {
    return await this.urlService.getUrlMeta(urlId);
  }
}
