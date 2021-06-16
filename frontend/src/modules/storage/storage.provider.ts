import { AsyncLocalStorage } from 'async_hooks';

export const STORAGE = 'STORAGE';
export const storageProvider = {
  provide: STORAGE,
  useFactory: async () => {
    return new AsyncLocalStorage();
  },
};
