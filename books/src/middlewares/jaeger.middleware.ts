import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { JaegerTracer } from 'jaeger-client';
import { FORMAT_HTTP_HEADERS, Tags } from 'opentracing';

import { JAEGER_CLIENT } from '../modules/jaeger/jaeger.provider';
import { STORAGE } from '../modules/storage/storage.provider';

@Injectable()
export class TracingMiddleware implements NestMiddleware {
  constructor(
    @Inject(JAEGER_CLIENT) private readonly tracer: JaegerTracer,
    @Inject(STORAGE) private readonly storage: AsyncLocalStorage<any>,
  ) {}

  use(req: any, res: any, next: () => void): any {
    this.storage.run(new Map(), () => {
      const spanCtx = this.tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
      const span = this.tracer.startSpan(
        'http_request',
        spanCtx ? { childOf: spanCtx } : undefined,
      );

      span.addTags({
        [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_PRODUCER,
        [Tags.HTTP_METHOD]: req.method,
        [Tags.HTTP_URL]: req.path,
      });

      const store = this.storage.getStore();
      store.set('span', span);

      res.on('finish', () => {
        if (res.statusCode >= 500) {
          // Force the span to be collected for http errors
          span.setTag(Tags.SAMPLING_PRIORITY, 1);
          // If error then set the span to error
          span.setTag(Tags.ERROR, true);

          // Response should have meaning info to futher troubleshooting
          span.log({ event: 'error', message: res.statusMessage });
        }

        span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);
        span.log({ event: 'http_request_end' });
        span.finish();
      });

      next();
    });
  }
}
