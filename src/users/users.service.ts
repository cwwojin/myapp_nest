import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryFailedError } from 'typeorm';
import { URL } from '@src/url/entities';
import { User } from '@src/users/entities';
import {
  CreateUserDto,
  UpdatePasswordDto,
  DeleteUserDto,
  UpdateRefreshTokenDto,
} from '@src/users/dto/users.dto';
import { AwsService } from '@src/aws/aws.service';
import { getFileExtension } from '@src/utils/functions';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly awsService: AwsService,
  ) {}

  /**
   * Get a User by ID.
   *
   * @param userId
   * @returns The returned data object.
   */
  async getUserById(userId: string) {
    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();

    return user;
  }

  /**
   * Register a new user.
   *
   * @param email - User email
   * @param password - User password
   * @returns The inserted data object.
   */
  async signUp(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const user = new User();
    user.email = email;
    user.username = email.split('@')[0];
    user.password = await user.hashPassword(password);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return savedUser;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      if (e instanceof QueryFailedError) {
        throw new BadRequestException(
          `DB query failed. Please check the email & password constraints.`,
        );
      } else {
        throw e;
      }
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get User Account Info.
   *
   * @param userId - user ID
   * @returns The retrieved data object.
   */
  async getMyAccountInfo(userId: string) {
    const result = await User.createQueryBuilder('u')
      .select(['u.id', 'u.email', 'u.username'])
      .where('u.id = :userId', { userId })
      .getOne();

    if (result) {
      return result;
    } else {
      throw new NotFoundException(`No User Found : ${userId}`);
    }
  }

  /**
   * Update User Password.
   *
   * @param userId
   * @param updatePasswordDto
   * @returns
   */
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { password, newPassword } = updatePasswordDto;

    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();

    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const pwMatch = await user.comparePassword(password, user.password);
    if (!pwMatch) throw new BadRequestException(`Current password is invalid.`);

    user.password = await user.hashPassword(newPassword);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update Saved Refresh Token.
   *
   * @param userId
   * @param updateRefreshTokenDto
   * @returns The updated data object.
   */
  async updateRefreshToken(
    userId: string,
    updateRefreshTokenDto: UpdateRefreshTokenDto,
  ) {
    const { refreshToken } = updateRefreshTokenDto;

    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();

    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    user.refreshToken = await user.hashRefreshToken(refreshToken);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Remove a User Account.
   *
   * @param userId - user ID
   * @param password - user password
   * @returns HTTP Status 200 OK
   */
  async signOut(userId: string, deleteUserDto: DeleteUserDto) {
    const { password } = deleteUserDto;

    const user = await User.createQueryBuilder('u')
      .where('u.id = :userId', { userId })
      .getOne();

    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const pwMatch = await user.comparePassword(password, user.password);
    if (!pwMatch) throw new BadRequestException(`Invalid Password.`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softRemove(user);
      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all URL's saved by the user.
   *
   * @param userId - user ID
   * @returns List of the returned data objects, and the count.
   */
  async getMyUrls(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const result = await URL.createQueryBuilder('url')
      .select([
        'url.pk',
        'url.shortUrl',
        'url.originalUrl',
        'm.userId',
        'm.lastClickedTime',
        'url.createdAt',
        'url.updatedAt',
      ])
      .innerJoin('url_meta', 'm', 'm.urlId = url.pk')
      .where('m.userId = :userId', { userId: user.pk })
      .getManyAndCount();

    if (result) {
      return result;
    } else {
      throw new NotFoundException(
        `No Data Found with the given user ID : ${userId}`,
      );
    }
  }

  /**
   * Upload a User Profile Image.
   *
   * @param userId - User ID
   * @param file - The uploaded file
   * @returns The saved file location in S3
   */
  async updateProfileImage(userId: string, file: Express.Multer.File) {
    const user = await this.getUserById(userId);
    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (!file) throw new BadRequestException(`Please attach a valid file.`);

      const { buffer, originalname } = file;
      const extension = getFileExtension(originalname);
      const destKey = `images/users/${userId}/${Date.now()}.${extension}`;
      // const awsLocation = this.configService.get('AWS_LOCATION');
      // const destLocation = `${awsLocation}/${destKey}`;

      const { Location } = await this.awsService.uploadFileToS3(
        buffer,
        destKey,
      );

      user.profileImageFile = Location;
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return Location;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProfileImage(userId: string) {
    const user = await this.getUserById(userId);
    if (!user) throw new NotFoundException(`No User Found : ${userId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const fileLocation = user.profileImageFile;
      // if (fileLocation.length) {
      //   const fileKey = fileLocation.replace(
      //     `${this.configService.get('AWS_LOCATION')}/`,
      //     '',
      //   );
      //   await this.awsService.deleteFileFromS3(fileKey);
      // }

      user.profileImageFile = '';
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
