import { MiddlewareConsumer, Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { RedisModule } from '../redis/redis.module';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { JaegerModule } from '../jaeger/jaeger.module';
import { StorageModule } from '../storage/storage.module';
import { TracingMiddleware } from '../../middlewares/jaeger.middleware';

@Module({
  imports: [ApiModule, RedisModule, JaegerModule, StorageModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('/');
  }
}
