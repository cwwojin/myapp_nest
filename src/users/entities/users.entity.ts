import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { IsEmail, IsString } from 'class-validator';
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Check,
  Index,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { URLMeta } from '@src/url/entities/url.entity';
import { BCRYPT_SALTROUNDS } from '@src/utils/constants';

/**
 * Users Table.
 */
@Entity('user')
@Index(['id', 'email'])
@Check(`"username" <> '' AND "password" <> ''`)
export class User extends BaseEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({
    type: 'varchar',
    length: 31,
    default: '',
    nullable: false,
    unique: true,
  })
  id: string;

  @Column({ type: 'text', nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Exclude()
  @Column({ type: 'text', nullable: false })
  @IsString()
  password: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  @IsString()
  username: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  @IsString()
  refreshToken: string;

  @Column({ type: 'text', default: '' })
  @IsString()
  profileImageFile: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
  @DeleteDateColumn() deletedAt: Date;

  /* ====================================================== */
  /* START One-To-Many Relations                            */
  /* ====================================================== */

  @OneToMany(() => URLMeta, (urlMeta) => urlMeta.userId)
  urls: Promise<URLMeta[]>;

  /* ====================================================== */
  /* END One-To-Many Relations                              */
  /* ====================================================== */

  /* ====================================================== */
  /* START Entity Function                                  */
  /* ====================================================== */

  @BeforeInsert()
  assignId() {
    this.id = nanoid();
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, BCRYPT_SALTROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async hashRefreshToken(refreshToken: string) {
    return await bcrypt.hash(refreshToken, BCRYPT_SALTROUNDS);
  }

  async compareRefreshToken(refreshToken: string, hashedToken: string) {
    return await bcrypt.compare(refreshToken, hashedToken);
  }

  /* ====================================================== */
  /* END Entity Function                                    */
  /* ====================================================== */
}
