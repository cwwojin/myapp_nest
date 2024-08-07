import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('redirect')
@Controller()
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':shortUrl')
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string) {
    const originalUrl = await this.redirectService.redirect(shortUrl);

    return { url: originalUrl, statusCode: 301 };
  }
}
