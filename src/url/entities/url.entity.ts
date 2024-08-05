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
} from 'typeorm';
import { User } from '@src/users/entities';

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

  @Column({ type: 'varchar', length: 16, nullable: false, unique: true })
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
}

/**
 * URL Metadata Table.
 */
@Entity('url_meta')
@Index(['userId'])
export class URLMeta extends BaseEntity {
  @PrimaryGeneratedColumn()
  pk: number;

  @Column({ type: 'timestamp' })
  lastClickedTime: Date;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  /* ====================================================== */
  /* START One-To-One Relations                             */
  /* ====================================================== */

  @OneToOne(() => URL, (url) => url.urlMeta, {
    eager: true,
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
