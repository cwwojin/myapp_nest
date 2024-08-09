import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('redirect')
@Controller()
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get(':shortUrl')
  @ApiOperation({
    summary: `Redirect the short-URL to the original-URL (long URL).`,
  })
  @Redirect()
  async redirect(@Param('shortUrl') shortUrl: string) {
    const originalUrl = await this.redirectService.redirect(shortUrl);

    return { url: originalUrl, statusCode: 301 };
  }
}
