import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AuthorsModule } from './modules/authors/authors.module';
import { RedisModule } from './modules/redis/redis.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StorageModule } from './modules/storage/storage.module';
import { PrometheusModule } from './modules/prometheus/prometheus.module';
import { PrometheusInterceptor } from './modules/prometheus/prometheus.interceptor';

@Module({
  providers: [
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
  ],
  imports: [RedisModule, AuthorsModule, StorageModule, PrometheusModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
