export interface OrderCreateI {
  readonly merchantId?: string;
  readonly email?: string;
  readonly price: number;
  readonly currencyCode: string;
}
