import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusProvider } from './prometheus.provider';
import { Response } from 'express';

@Controller('metrics')
export class PrometheusController {
  constructor(private readonly prometheusProvider: PrometheusProvider) {}

  @Get('/')
  async getMetrics(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Content-Type', this.prometheusProvider.getHeader());
    return await this.prometheusProvider.getMetrics();
  }
}
