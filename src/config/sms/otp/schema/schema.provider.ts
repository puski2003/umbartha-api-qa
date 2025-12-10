import { Connection } from 'mongoose';
import { OTP_COLLECTION, OTP_MODEL } from '../otp.constants';
import { OtpSchema } from './otp.shema';

export const OtpSchemaProvider = [
  {
    provide: OTP_MODEL,
    inject: ['Umbartha'],
    useFactory: (connection: Connection) => {
      return connection.model(OTP_COLLECTION, OtpSchema);
    },
  },
];
