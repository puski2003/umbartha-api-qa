import { Module } from '@nestjs/common';
import { PublicPayitForwardController } from './public-payit-forward.controller';
import { PublicPayitForwardService } from './public-payit-forward.service';
import { PayitForwardModule } from 'src/modules/payit-forward/payit-forward.module';

@Module({
  imports: [PayitForwardModule],
  controllers: [PublicPayitForwardController],
  providers: [PublicPayitForwardService],
})
export class PublicPayitForwardModule {}
