import { Connection } from 'mongoose';
import { COUPON_COLLECTION, COUPON_MODEL } from '../coupon.constants';
import { CouponSchema } from './coupon.schema';

export const CouponSchemaProvider = [
  {
    provide: COUPON_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(COUPON_COLLECTION, CouponSchema);
    },
  },
];
