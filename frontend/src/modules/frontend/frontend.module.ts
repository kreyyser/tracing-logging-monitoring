import { MiddlewareConsumer, Module, Logger } from '@nestjs/common';
import { ApiModule } from '../api/api.module';

import { FrontendController } from './frontend.controller';
import { TracingMiddleware } from '../../middlewares/jaeger.middleware';
import { JaegerModule } from '../jaeger/jaeger.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  providers: [Logger],
  imports: [ApiModule, JaegerModule, StorageModule],
  controllers: [FrontendController],
})
export class FrontendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TracingMiddleware).forRoutes('/');
  }
}
