import { Logger, Module } from '@nestjs/common';
import { jaegerProvider } from './jaeger.provider';

@Module({
  providers: [jaegerProvider, Logger],
  exports: [jaegerProvider],
})
export class JaegerModule {}
