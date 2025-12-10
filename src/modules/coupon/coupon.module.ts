import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponSchema } from './schemas/coupon.schema';
import { COUPON_COLLECTION } from './coupon.constants';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { CounsellorSchema } from '../counsellor/schemas/counsellor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COUPON_COLLECTION, schema: CouponSchema },
      { name: COUNSELLOR_COLLECTION, schema: CounsellorSchema },
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService],
})
export class CouponModule {}
