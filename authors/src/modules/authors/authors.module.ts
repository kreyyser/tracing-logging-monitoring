import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';

import { RedisModule } from '../redis/redis.module';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { JaegerModule } from '../jaeger/jaeger.module';
import { StorageModule } from '../storage/storage.module';
import { TracingMiddleware } from '../../middlewares/jaeger.middleware';

@Module({
  imports: [RedisModule, JaegerModule, StorageModule],
  controllers: [AuthorsController],
  providers: [AuthorsService, Logger],
})
export class AuthorsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('/');
  }
}
