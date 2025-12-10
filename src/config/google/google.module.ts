import { Module } from '@nestjs/common';
import { SheetApiModule } from './sheet-api/sheet-api.module';

@Module({
  imports: [SheetApiModule],
})
export class GoogleModule {}
