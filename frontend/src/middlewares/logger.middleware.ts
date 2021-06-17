import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as expressWinston from 'express-winston';
import { STORAGE } from '../modules/storage/storage.provider';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: Logger,
    @Inject(STORAGE) private readonly storage: AsyncLocalStorage<any>,
  ) {
    this.use = expressWinston.logger({
      winstonInstance: this.logger as any,
      meta: true,
      expressFormat: true,
      dynamicMeta: (req, res) => {
        const spanCtx = this.storage.getStore().get('span').context();
        return {
          traceId: spanCtx.traceIdStr,
          spanId: spanCtx.spanIdStr,
          parentId: spanCtx.parentIdStr,
        };
      },
    });
  }

  use: (req: Request, res: Response, next: NextFunction) => void;
}
