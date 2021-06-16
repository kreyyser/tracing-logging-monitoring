import { Module } from '@nestjs/common';

import { ApiService } from './api.service';
import { JaegerModule } from '../jaeger/jaeger.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [JaegerModule, StorageModule],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
