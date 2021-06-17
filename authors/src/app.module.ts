import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthorsModule } from './modules/authors/authors.module';
import { RedisModule } from './modules/redis/redis.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  providers: [Logger],
  imports: [RedisModule, AuthorsModule, StorageModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
