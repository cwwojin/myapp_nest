import { Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';
import { UrlModule } from '@src/url/url.module';

@Module({
  imports: [UrlModule],
  controllers: [RedirectController],
  providers: [RedirectService],
  exports: [RedirectService],
})
export class RedirectModule {}
