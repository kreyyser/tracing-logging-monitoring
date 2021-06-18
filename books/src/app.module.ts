import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ApiModule } from './modules/api/api.module';
import { BooksModule } from './modules/books/books.module';
import { RedisModule } from './modules/redis/redis.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StorageModule } from './modules/storage/storage.module';
import { PrometheusInterceptor } from './modules/prometheus/prometheus.interceptor';
import { PrometheusModule } from './modules/prometheus/prometheus.module';

@Module({
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
  ],
  imports: [
    ApiModule,
    RedisModule,
    BooksModule,
    StorageModule,
    PrometheusModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
