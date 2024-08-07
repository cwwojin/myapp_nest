import { Injectable } from '@nestjs/common';
import { UrlService } from '@src/url/url.service';

@Injectable()
export class RedirectService {
  constructor(private readonly urlService: UrlService) {}

  /**
   * Get the destination URL for redirection.
   *
   * @param shortUrl - the Short URL
   * @returns The destination URL, which is the original URL
   */
  async redirect(shortUrl: string) {
    try {
      const { originalUrl } = await this.urlService.getOriginalUrl(shortUrl);

      return originalUrl;
    } catch (e) {
      throw e;
    }
  }
}
