import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { FORMAT_HTTP_HEADERS } from 'opentracing';
import { AsyncLocalStorage } from 'async_hooks';
import { JaegerTracer } from 'jaeger-client';

import { ApiClient } from './api.interface';
import { JAEGER_CLIENT } from '../jaeger/jaeger.provider';
import { STORAGE } from '../storage/storage.provider';

@Injectable()
export class ApiService {
  private readonly authorsApi: ApiClient;

  constructor(
    @Inject(JAEGER_CLIENT) private readonly tracer: JaegerTracer,
    @Inject(STORAGE) private readonly storage: AsyncLocalStorage<any>,
  ) {
    this.setupInterceptors();
    this.authorsApi = this.createApiClient(
      'http://authors:8081/api/v1/authors',
    );
  }

  private setupInterceptors() {
    axios.interceptors.request.use((config: AxiosRequestConfig) => {
      const span = this.storage.getStore().get('span');
      this.tracer.inject(span, FORMAT_HTTP_HEADERS, config.headers);

      return config;
    });
  }

  public getAuthorsApi(): ApiClient {
    return this.authorsApi;
  }

  private createApiClient(baseURL = ''): ApiClient {
    return {
      get: (
        url,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> => axios.get(url, { ...config, baseURL }),
      post: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.post(url, data, { ...config, baseURL }),
      patch: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.patch(url, data, { ...config, baseURL }),
      put: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> => axios.put(url, data, { ...config, baseURL }),
      delete: (
        url,
        data,
        config: AxiosRequestConfig & { public: boolean },
      ): Promise<AxiosResponse> =>
        axios.delete(url, { ...config, baseURL, data }),
    };
  }
}
