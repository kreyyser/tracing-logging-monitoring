import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';

import { ApiModule } from './modules/api/api.module';
import { BooksModule } from './modules/books/books.module';
import { RedisModule } from './modules/redis/redis.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  providers: [Logger],
  imports: [ApiModule, RedisModule, BooksModule, StorageModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
