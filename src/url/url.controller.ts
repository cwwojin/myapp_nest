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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('url')
@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Generate a new short-URL and save to DB.`,
  })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        pk: { type: 'number' },
        shortUrl: {
          type: 'string',
          description: 'Shortened URL : 6-digit Base62 string',
          example: '010113',
        },
        originalUrl: {
          type: 'string',
          description: 'Original (Long) URL',
          example: 'www.long-website-name.com/long/path/to/resource',
        },
        createdAt: { type: 'Date' },
        updatedAt: { type: 'Date' },
      },
    },
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
  @ApiParam({
    name: 'shortUrl',
    type: 'string',
    description: 'short-URL',
    example: '000001',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        pk: { type: 'number' },
        shortUrl: {
          type: 'string',
          description: 'Shortened URL : 6-digit Base62 string',
          example: '010113',
        },
        originalUrl: {
          type: 'string',
          description: 'Original (Long) URL',
          example: 'www.long-website-name.com/long/path/to/resource',
        },
        createdAt: { type: 'Date' },
        updatedAt: { type: 'Date' },
      },
    },
  })
  @Get('get/:shortUrl')
  async getOriginalUrl(@Param('shortUrl') shortUrl: string) {
    return await this.urlService.getOriginalUrl(shortUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Delete a short-URL.`,
  })
  @ApiParam({
    name: 'shortUrl',
    type: 'string',
    description: 'short-URL',
    example: '000001',
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
  @ApiParam({
    name: 'urlId',
    type: 'number',
    description: 'URL Primary Key ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        pk: { type: 'number' },
        lastClickedTime: {
          type: 'Date',
          description: 'Timestamp of the latest click to this URL',
          example: 'TIMESTAMP',
        },
        createdAt: { type: 'Date' },
        updatedAt: { type: 'Date' },
      },
    },
  })
  @Get('inspect/:urlId')
  async getUrlMeta(@Req() req: IRequest, @Param('urlId') urlId: number) {
    return await this.urlService.getUrlMeta(req.user.id, urlId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: `Get all click-history of a given URL.`,
  })
  @ApiParam({
    name: 'urlId',
    type: 'number',
    description: 'URL Primary Key ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'list',
      properties: {
        pk: { type: 'number' },
        clickedTime: {
          type: 'Date',
          description: 'Timestamp of the click',
          example: 'TIMESTAMP',
        },
        createdAt: { type: 'Date' },
        updatedAt: { type: 'Date' },
      },
      example: [
        {
          pk: 1,
          clickedTime: 'TIMESTAMP',
          createdAt: 'TIMESTAMP',
          updatedAt: 'TIMESTAMP',
        },
        1,
      ],
    },
  })
  @Get('history/:urlId')
  async getUrlHistory(@Req() req: IRequest, @Param('urlId') urlId: number) {
    return await this.urlService.getUrlHistory(req.user.id, urlId);
  }
}
