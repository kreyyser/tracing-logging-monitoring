import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';

import { FrontendModule } from './modules/frontend/frontend.module';
import { ApiModule } from './modules/api/api.module';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  providers: [Logger],
  imports: [ApiModule, FrontendModule, StorageModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('/');
  }
}
