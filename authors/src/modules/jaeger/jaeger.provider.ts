import { initTracerFromEnv } from 'jaeger-client';
import * as opentracing from 'opentracing';

export const JAEGER_CLIENT = 'JAEGER_CLIENT';
export const jaegerProvider = {
  provide: JAEGER_CLIENT,
  useFactory: async () => {
    const config = {
      serviceName: 'authors',
      sampler: {
        type: 'const',
        param: 1,
      },
      reporter: {
        logSpans: true,
      },
    };

    const options = {
      tags: {
        version: '0.0.1',
      },
      logger: console,
    };

    opentracing.initGlobalTracer(initTracerFromEnv(config, options));

    return opentracing.globalTracer();
  },
};
