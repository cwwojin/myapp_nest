import { Injectable, NotFoundException } from '@nestjs/common';
import { UrlService } from '@src/url/url.service';
import { URLClickHistory, URLMeta } from '@src/url/entities';
import { DataSource } from 'typeorm';

@Injectable()
export class RedirectService {
  constructor(
    private readonly urlService: UrlService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get the destination URL for redirection.
   *
   * @param shortUrl - the Short URL
   * @returns The destination URL, which is the original URL
   */
  async redirect(shortUrl: string) {
    const savedUrl = await this.urlService.getOriginalUrl(shortUrl);

    if (!savedUrl) throw new NotFoundException(`URL Not Found : ${shortUrl}`);
    const { originalUrl } = savedUrl;

    // Log this click
    const now = new Date();
    const clickLog = new URLClickHistory();
    clickLog.urlId = savedUrl;
    clickLog.clickedTime = now;

    // Update `LastClickedTime`
    const savedUrlMeta = await URLMeta.createQueryBuilder('um')
      .where('um.urlId = :urlId', { urlId: savedUrl.pk })
      .getOne();
    savedUrlMeta.lastClickedTime = now;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(clickLog);
      await queryRunner.manager.save(savedUrlMeta);
      await queryRunner.commitTransaction();

      console.log(`URL Clicked : ${now}`);

      return originalUrl;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
