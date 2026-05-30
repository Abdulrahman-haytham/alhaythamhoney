import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepo: Repository<Article>,
  ) {}

  /** Published article metadata (no heavy content body) for the listing page. */
  findAll(): Promise<Article[]> {
    return this.articlesRepo.find({
      where: { isPublished: true },
      select: [
        'id',
        'slug',
        'title',
        'description',
        'keywords',
        'imageUrl',
        'publishedAt',
        'sortOrder',
      ],
      order: { sortOrder: 'ASC', publishedAt: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepo.findOne({
      where: { slug, isPublished: true },
    });
    if (!article) {
      throw new NotFoundException(`Article '${slug}' not found`);
    }
    // Best-effort view counter (non-blocking semantics not required here)
    await this.articlesRepo.increment({ id: article.id }, 'viewCount', 1);
    return article;
  }
}
