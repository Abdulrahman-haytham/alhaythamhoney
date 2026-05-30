import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Stable slug matching the legacy id and /articles/:slug route */
  @Column({ unique: true })
  slug: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  /** Rendered HTML body (legacy .md files already contain raw HTML) */
  @Column('text')
  content: string;

  @Column('simple-array', { nullable: true })
  keywords: string[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  imagePublicId: string;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  publishedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
