import { IsMongoId, IsNotEmpty } from 'class-validator';

export class BookingPaymentParams {
  @IsNotEmpty()
  @IsMongoId()
  readonly bookingPaymentId: string;
}

export class PaymentOptionDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly paymentOption: string;
}
