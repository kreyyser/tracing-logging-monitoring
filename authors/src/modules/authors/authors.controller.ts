import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { RedisClient } from 'redis';
import { AsyncLocalStorage } from 'async_hooks';

import { AuthorsService } from './authors.service';
import { AuthorDto, CreateAuthorInput } from './authors.dto';
import { REDIS_CONNECTION, REDIS_TOPIC } from '../redis/redis.providers';
import { JAEGER_CLIENT } from '../jaeger/jaeger.provider';
import { Author } from './authors.model';
import { STORAGE } from '../storage/storage.provider';

@Controller('api/v1/authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
    private readonly logger: Logger,
    @Inject(REDIS_CONNECTION)
    private readonly redisInstance: RedisClient,
    @Inject(JAEGER_CLIENT)
    private readonly tracer,
    @Inject(STORAGE)
    private readonly storage: AsyncLocalStorage<any>,
  ) {
    this.logger.setContext(AuthorsController.name);
  }

  @Get('/')
  getAuthors(): AuthorDto[] {
    this.logger.log({
      level: 'info',
      message: 'Fetching authors',
      ...this.getTraceData(),
    });

    const span = this.tracer.startSpan('redis.authors.list', {
      childOf: this.storage.getStore().get('span'),
    });

    this.sendPushNotification(new Author('1'));
    const authors = this.authorsService.getAuthors();

    span.finish();

    return authors;
  }

  @Get('/:id')
  getAuthorById(@Param('id') id: string): AuthorDto {
    console.log('Get author by ID');
    this.sendPushNotification(new Author('1'));
    return this.authorsService.findById(id);
  }

  @Post('/')
  createAuthor(@Body() data: CreateAuthorInput): AuthorDto {
    console.log('Create author');
    const author = this.authorsService.create(data);
    this.sendPushNotification(author);
    return author;
  }

  private sendPushNotification(response: AuthorDto): void {
    this.redisInstance.set(REDIS_TOPIC, JSON.stringify(response));
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
