import { Controller, Get, Param } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /** Listing metadata — used by ArticlesPage. */
  @Get()
  getArticles() {
    return this.articlesService.findAll();
  }

  /** Full article (with content) — used by ArticleDetailPage. */
  @Get(':slug')
  getArticle(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }
}
