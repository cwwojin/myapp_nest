import { IsUrl } from 'class-validator';
import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Relation,
  AfterInsert,
} from 'typeorm';
import { User } from '@src/users/entities';
import { toBase62 } from '@src/utils/functions';
import { HASH_MAXLENGTH } from '@src/utils/constants';

/**
 * URL Table for storing the original URL & shortened hash.
 */
@Entity('url')
@Index(['shortUrl'])
export class URL extends BaseEntity {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({ type: 'text', nullable: false })
  @IsUrl()
  originalUrl: string;

  @Column({
    type: 'varchar',
    length: 16,
    nullable: true,
    unique: true,
  })
  shortUrl: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  /* ====================================================== */
  /* START One-To-One Relations                             */
  /* ====================================================== */

  @OneToOne(() => URLMeta, (urlMeta) => urlMeta.urlId, { nullable: true })
  urlMeta: Relation<URLMeta>;

  /* ====================================================== */
  /* END One-To-One Relations                               */
  /* ====================================================== */

  /* ====================================================== */
  /* START Entity Function                                  */
  /* ====================================================== */

  @AfterInsert()
  assignShortUrl() {
    const shortUrl = toBase62(this.pk);
    // pad to MAX_LENGTH
    this.shortUrl = shortUrl.padStart(HASH_MAXLENGTH, '0');
  }

  /* ====================================================== */
  /* END Entity Function                                    */
  /* ====================================================== */
}

/**
 * URL Metadata Table.
 */
@Entity('url_meta')
@Index(['userId'])
export class URLMeta extends BaseEntity {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({ type: 'timestamp', nullable: true })
  lastClickedTime: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  /* ====================================================== */
  /* START One-To-One Relations                             */
  /* ====================================================== */

  @OneToOne(() => URL, (url) => url.urlMeta, {
    // eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'urlId' })
  urlId: Relation<URL>;

  /* ====================================================== */
  /* END One-To-One Relations                               */
  /* ====================================================== */

  /* ====================================================== */
  /* START Many-To-One Relations                            */
  /* ====================================================== */

  @ManyToOne(() => User, (user) => user.urls, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  userId: Relation<User>;

  /* ====================================================== */
  /* END Many-To-One Relations                              */
  /* ====================================================== */
}

@Entity()
@Index(['urlId'])
export class URLClickHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({
    type: 'timestamp',
    default: () => `CURRENT_TIMESTAMP`,
    nullable: false,
  })
  clickedTime: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  /* ====================================================== */
  /* START Many-To-One Relations                            */
  /* ====================================================== */

  @ManyToOne(() => URL, (url) => url.urlMeta, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'urlId' })
  urlId: Relation<URL>;

  /* ====================================================== */
  /* END Many-To-One Relations                              */
  /* ====================================================== */
}
