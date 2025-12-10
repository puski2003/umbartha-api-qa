import { Module } from '@nestjs/common';
import { SESService } from './service';
import { SESController } from './controller';

@Module({
  controllers: [SESController],
  providers: [SESService],
  exports: [SESService],
})
export class SESModule {}
