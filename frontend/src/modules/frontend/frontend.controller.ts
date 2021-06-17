import { Logger, Controller, Get, Inject } from '@nestjs/common';

import { ApiClient, ApiResponse } from '../api/api.interface';
import { ApiService } from '../api/api.service';
import { AuthorDto, BookDto, BooksAndAuthorsDto } from './frontend.dto';
import { STORAGE } from '../storage/storage.provider';
import { AsyncLocalStorage } from 'async_hooks';

@Controller('api/v1/details')
export class FrontendController {
  private readonly authorsApi: ApiClient;
  private readonly booksApi: ApiClient;

  constructor(
    private readonly logger: Logger,
    apiService: ApiService,
    @Inject(STORAGE)
    private readonly storage: AsyncLocalStorage<any>,
  ) {
    this.authorsApi = apiService.getAuthorsApi();
    this.booksApi = apiService.getBooksApi();
    this.logger.setContext(FrontendController.name);
  }

  @Get('/')
  async getBooksAndAuthors(): Promise<BooksAndAuthorsDto> {
    this.logger.log({
      level: 'info',
      message: 'Fetching books and authors',
      ...this.getTraceData(),
    });

    const { data: authors }: ApiResponse<AuthorDto[]> =
      await this.authorsApi.get('/');

    this.logger.log({
      level: 'info',
      message: 'Authors fetched',
      ...this.getTraceData(),
    });

    const { data: books }: ApiResponse<BookDto[]> = await this.booksApi.get(
      '/',
    );

    this.logger.log({
      level: 'info',
      message: 'Books fetched',
      ...this.getTraceData(),
    });

    return { authors, books };
  }

  private getTraceData() {
    const spanCtx = this.storage.getStore().get('span').context();
    return {
      traceId: spanCtx.traceIdStr,
      spanId: spanCtx.spanIdStr,
      parentId: spanCtx.parentIdStr,
    };
  }
}
