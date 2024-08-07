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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('url')
@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Generate a new short-URL and save to DB.`,
  })
  @Post('new')
  async generateShortUrl(
    @Req() req: IRequest,
    @Body() createUrlDto: CreateUrlDto,
  ) {
    return await this.urlService.generateShortUrl(req.user.id, createUrlDto);
  }

  @ApiOperation({
    summary: `Get the URL data by short-URL.`,
  })
  @Get('get/:shortUrl')
  async getOriginalUrl(@Param('shortUrl') shortUrl: string) {
    return await this.urlService.getOriginalUrl(shortUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Delete a short-URL.`,
  })
  @Delete(':shortUrl')
  async deleteShortUrl(
    @Req() req: IRequest,
    @Param('shortUrl') shortUrl: string,
  ) {
    const deleteUrlDto: DeleteUrlDto = { shortUrl: shortUrl };

    return await this.urlService.deleteShortUrl(req.user.id, deleteUrlDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get a URL metadata.`,
  })
  @Get('inspect/:urlId')
  async getUrlMeta(@Req() req: IRequest, @Param('urlId') urlId: number) {
    return await this.urlService.getUrlMeta(req.user.id, urlId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get all click-history of a given URL.`,
  })
  @Get('history/:urlId')
  async getUrlHistory(@Req() req: IRequest, @Param('urlId') urlId: number) {
    return await this.urlService.getUrlHistory(req.user.id, urlId);
  }
}
