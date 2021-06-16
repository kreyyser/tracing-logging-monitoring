import { Module } from '@nestjs/common';
import { storageProvider } from './storage.provider';

@Module({
  providers: [storageProvider],
  exports: [storageProvider],
})
export class StorageModule {}
