import { Injectable } from '@nestjs/common';
import { Article } from '../article.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetArticlesDto } from '../dtos/get-articles.dto';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';
import { MediaFileMappingService } from 'src/common/media-file-mapping/providers/media-file-mapping.service';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class FindAllProvider {
  constructor(
    /**
     * Inject articleRepository
     */

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    /**
     * Inject mediaFileMappingService
     */

    private readonly mediaFileMappingService: MediaFileMappingService,

    /**
     * Inject paginationProvider
     */

    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async findAll(
    getArticlesDto: GetArticlesDto,
    user?: ActiveUserData,
  ): Promise<Paginated<Article> | Article[]> {
    /**
     * Public website case: infinite-scroll pages request pagination, while
     * smaller sections can still fetch the full published list.
     */
    if (getArticlesDto.isPublished) {
      if (getArticlesDto.category || getArticlesDto.tag) {
        const articleQuery = this.articleRepository
          .createQueryBuilder('article')
          .leftJoinAndSelect('article.createdBy', 'createdBy')
          .leftJoinAndSelect('article.updatedBy', 'updatedBy')
          .leftJoinAndSelect('article.featuredImage', 'featuredImage')
          .leftJoinAndSelect('article.categories', 'categories')
          .leftJoinAndSelect('article.tags', 'tags')
          .where('article.isPublished = :isPublished', { isPublished: true })
          .orderBy('article.createdAt', 'DESC');

        if (getArticlesDto.category) {
          articleQuery.andWhere('categories.slug = :category', {
            category: getArticlesDto.category,
          });
        }

        if (getArticlesDto.tag) {
          articleQuery.andWhere('tags.slug = :tag', {
            tag: getArticlesDto.tag,
          });
        }

        const result = await this.paginationProvider.paginateQueryBuilder(
          {
            limit: getArticlesDto.limit ?? 9,
            page: getArticlesDto.page ?? 1,
          },
          articleQuery,
        );

        result.data = this.mediaFileMappingService.mapArticles(result.data);

        return result;
      }

      const findOptions = {
        where: {
          isPublished: true,
        },
        relations: [
          'createdBy',
          'updatedBy',
          'featuredImage',
          'categories',
          'tags',
        ],
        order: {
          createdAt: 'DESC' as const,
        },
      };

      if (getArticlesDto.page || getArticlesDto.limit) {
        const result = await this.paginationProvider.paginateQuery(
          {
            limit: getArticlesDto.limit ?? 9,
            page: getArticlesDto.page ?? 1,
          },
          this.articleRepository,
          findOptions,
        );

        result.data = this.mediaFileMappingService.mapArticles(result.data);

        return result;
      }

      const articles = await this.articleRepository.find(findOptions);

      return this.mediaFileMappingService.mapArticles(articles);
    }

    /**
     * 🔥 PAGINATION (admin case)
     */
    const result = await this.paginationProvider.paginateQuery(
      {
        limit: getArticlesDto.limit ?? 10,
        page: getArticlesDto.page ?? 1,
      },
      this.articleRepository,
      {
        relations: ['featuredImage', 'categories', 'tags'],
        order: {
          createdAt: 'DESC',
        },
      },
    );

    result.data = this.mediaFileMappingService.mapArticles(result.data);

    return result;
  }
}
