import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { RedisClient } from 'redis';

import { REDIS_CONNECTION, REDIS_TOPIC } from '../redis/redis.providers';
import { BookDto, CreateBookInput } from './books.dto';
import { BooksService } from './books.service';
import { Book } from './books.model';
import { JAEGER_CLIENT } from '../jaeger/jaeger.provider';
import { STORAGE } from '../storage/storage.provider';
import { AsyncLocalStorage } from 'async_hooks';

@Controller('api/v1/books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    @Inject(REDIS_CONNECTION)
    private readonly redisInstance: RedisClient,
    @Inject(JAEGER_CLIENT)
    private readonly tracer,
    @Inject(STORAGE)
    private readonly storage: AsyncLocalStorage<any>,
  ) {}

  @Get('/')
  async getBooks(): Promise<BookDto[]> {
    console.log('Get books');

    const span = this.tracer.startSpan('redis.books.list', {
      childOf: this.storage.getStore().get('span'),
    });

    const books = this.booksService.getBooks();
    this.sendPushNotification(new Book('1'));

    span.finish();

    return books;
  }

  @Get('/:id')
  getBookById(@Param('id') id: string): BookDto {
    console.log('Get a book by ID');
    const book = this.booksService.findById(id);
    this.sendPushNotification(new Book('1'));
    return book;
  }

  @Post('/')
  async createBook(@Body() data: CreateBookInput): Promise<BookDto> {
    console.log('Create a book');
    const book = await this.booksService.create(data);
    this.sendPushNotification(book);
    return book;
  }

  private sendPushNotification(response: BookDto): void {
    this.redisInstance.set(REDIS_TOPIC, JSON.stringify(response));
  }
}
