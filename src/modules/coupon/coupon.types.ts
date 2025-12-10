import { DiscountType } from './schemas/coupon.schema';

export interface CouponI {
  readonly name: string;
  readonly discountType: DiscountType;
  readonly maxDiscount: number;
  readonly amount: number;
  readonly validThrough: Date;
  readonly usedOn: Date;
}

export interface CreateCouponI {
  readonly numberOfCoupons: number;
  readonly couponDetails: {
    readonly name: string;
    readonly discountType: DiscountType;
    readonly maxDiscount: number;
    readonly amount: number;
    readonly validThrough: Date;
  };
  readonly counsellor: string;
}

export interface UpdateCouponI {
  readonly discountType: DiscountType;
  readonly maxDiscount: number;
  readonly amount: number;
  readonly validThrough: Date;
}
