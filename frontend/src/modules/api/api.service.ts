import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { JaegerTracer } from 'jaeger-client';
import { AsyncLocalStorage } from 'async_hooks';
import { FORMAT_HTTP_HEADERS } from 'opentracing';

import { ApiClient } from './api.interface';
import { STORAGE } from '../storage/storage.provider';
import { JAEGER_CLIENT } from '../jaeger/jaeger.provider';

@Injectable()
export class ApiService {
  private readonly authorsApi: ApiClient;
  private readonly booksApi: ApiClient;

  constructor(
    @Inject(JAEGER_CLIENT) private readonly tracer: JaegerTracer,
    @Inject(STORAGE) private readonly storage: AsyncLocalStorage<any>,
  ) {
    this.setupInterceptors();
    this.authorsApi = this.createApiClient(
      'http://authors:8081/api/v1/authors',
    );
    this.booksApi = this.createApiClient('http://books:8082/api/v1/books');
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

  public getBooksApi(): ApiClient {
    return this.booksApi;
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
