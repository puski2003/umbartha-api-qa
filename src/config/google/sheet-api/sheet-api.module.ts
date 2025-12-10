import { Module } from '@nestjs/common';
import { SheetApiService } from './sheet-api.service';

@Module({
  providers: [SheetApiService],
  exports: [SheetApiService],
})
export class SheetApiModule {}
