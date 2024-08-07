import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { URL, URLClickHistory, URLMeta } from '@src/url/entities';
import { User } from '@src/users/entities';
import { CreateUrlDto, DeleteUrlDto } from './dto/url.dto';
import { UsersService } from '@src/users/users.service';

@Injectable()
export class UrlService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Generate a short-URL and save into DB.
   *
   * @param originalUrl - the original URL
   * @param userId - user ID
   * @returns The inserted data object
   */
  async generateShortUrl(userId: string, createUrlDto: CreateUrlDto) {
    const { originalUrl } = createUrlDto;

    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();
    if (!user) {
      throw new NotFoundException(`No User Found : ${userId}`);
    }

    const newUrl = new URL();
    newUrl.originalUrl = originalUrl;
    const newUrlMeta = new URLMeta();
    newUrlMeta.userId = user;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedUrl = await queryRunner.manager.save(newUrl);
      await queryRunner.manager.save(savedUrl);

      newUrlMeta.urlId = savedUrl;
      await queryRunner.manager.save(newUrlMeta);
      await queryRunner.commitTransaction();

      return savedUrl;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retreive the original-URL using the short-URL.
   *
   * @param shortUrl - the shortened URL
   * @returns The retreieved data object
   */
  async getOriginalUrl(shortUrl: string) {
    const result = await URL.createQueryBuilder('url')
      .select([
        'url.shortUrl',
        'url.originalUrl',
        'url.createdAt',
        'url.updatedAt',
      ])
      .where('url.shortUrl = :shortUrl', { shortUrl })
      .getOne();

    if (result) {
      return result;
    } else {
      throw new NotFoundException(`URL Not Found : ${shortUrl}`);
    }
  }

  /**
   * Delete a short-URL from the database, only if it is owned by the user.
   *
   * @param userId - user ID
   * @param shortUrl - the shortened URL
   * @returns HTTP Status 200 OK
   */
  async deleteShortUrl(userId: string, deleteUrlDto: DeleteUrlDto) {
    const { shortUrl } = deleteUrlDto;
    const user = await this.usersService.getUserById(userId);

    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const result = await URL.createQueryBuilder('url')
      .select(['url.pk', 'url.shortUrl', 'url.originalUrl'])
      .innerJoin('url_meta', 'm', 'm.urlId = url.pk')
      .where('m.userId = :userId', { userId: user.pk })
      .andWhere('url.shortUrl = :shortUrl', { shortUrl })
      .getOne();

    if (result) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager.remove(result);
        await queryRunner.commitTransaction();

        return HttpStatus.OK;
      } catch (e) {
        await queryRunner.rollbackTransaction();
        throw e;
      } finally {
        await queryRunner.release();
      }
    } else {
      throw new NotFoundException(`No Data Found with the given URL & userId`);
    }
  }

  /**
   * Retrieves the URL metadata from the database.
   *
   * @param urlId - the URL ID in DB
   * @returns The retrieved data object
   */
  async getUrlMeta(urlId: number) {
    const result = await URLMeta.createQueryBuilder('m')
      .select([
        'm.pk',
        'url.shortUrl',
        'url.originalUrl',
        'm.urlId',
        'm.userId',
        'm.lastClickedTime',
        'm.createdAt',
        'm.updatedAt',
      ])
      .innerJoin('url', 'url', 'm.urlId = url.pk')
      .where('m.urlId = :urlId', { urlId })
      .getOne();

    if (result) {
      return result;
    } else {
      throw new NotFoundException(`URL Not Found with id : ${urlId}`);
    }
  }

  /**
   * Get All Click History of a given URL.
   *
   * @param urlId - URL ID
   * @returns The list of returned data objects, and the count.
   */
  async getUrlHistory(urlId: number) {
    const result = await URLClickHistory.createQueryBuilder('uh')
      .where('uh.urlId = :urlId', { urlId })
      .getManyAndCount();

    if (result) {
      return result;
    } else {
      throw new NotFoundException(`Requested Data Not Found.`);
    }
  }
}
