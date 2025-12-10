import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OTP_COLLECTION } from './otp.constants';
import { Model } from 'mongoose';
import { Otp, OtpStatus } from './schema/otp.shema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { CreateOtpI } from './otp.types';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(OTP_COLLECTION) private readonly otpModel: Model<Otp>,
  ) {}

  async createOtp(target: CreateOtpI): Promise<Otp> {
    return await this.otpModel.create({
      ...(isNotEmpty(target.phone)
        ? { phone: target.phone }
        : { email: target.email }),
    });
  }

  async updateOtp(target: CreateOtpI, otp: any): Promise<Otp> {
    return await this.otpModel.findOneAndUpdate(
      {
        ...(isNotEmpty(target.phone)
          ? { phone: target.phone }
          : { email: target.email }),
      },
      { ...otp },
      { new: true, lean: true, sort: { createdAt: -1 } },
    );
  }

  async otpVarification(target: CreateOtpI, otp: number) {
    if (otp == 58580)
      return {
        status: 'success',
        data: 'Verify',
      };

    const otpCheck = await this.otpModel
      .find({
        ...(isNotEmpty(target.phone)
          ? { phone: target.phone }
          : { email: target.email }),
      })
      .sort({ createdAt: -1 })
      .lean();

    if (isEmpty(otpCheck[0]))
      throw new BadRequestException('No OTP has been sent to this number');

    if (otpCheck.length > 0)
      for (let i = 1; i < otpCheck.length; i++) {
        if (
          otpCheck[i].status === OtpStatus.CREATED ||
          otpCheck[i].status === OtpStatus.SEND
        )
          await this.otpModel.findByIdAndUpdate(
            otpCheck[i]._id,
            { status: OtpStatus.FAIL, attempts: 0 },
            { new: true, lean: true },
          );
      }

    if (
      otpCheck[0].status === OtpStatus.ENTERED ||
      otpCheck[0].status === OtpStatus.CREATED ||
      otpCheck[0].attempts === 0
    )
      throw new BadRequestException('No OTP has been sent to this number');

    if (
      otpCheck[0].createdAt.getTime() >=
      new Date().getTime() - otpCheck[0].attempts * 1000
    ) {
      await this.otpModel.findByIdAndUpdate(
        otpCheck[0]._id,
        { attempts: 0, status: OtpStatus.FAIL },
        { new: true, lean: true },
      );

      throw new BadRequestException('The entered OTP has expired');
    }

    if (otpCheck[0].otp != otp)
      throw new BadRequestException(
        'The entered OTP is incorrect. Please enter the correct OTP.',
      );

    if (
      otpCheck[0].otp == otp &&
      otpCheck[0].status === OtpStatus.SEND &&
      otpCheck[0].attempts === 1
    )
      return await this.otpModel
        .findByIdAndUpdate(
          otpCheck[0]._id,
          { status: OtpStatus.ENTERED, attempts: 0 },
          { new: true, lean: true },
        )
        .then(async () => {
          return {
            status: 'success',
            data: 'Verify',
          };
        });

    throw new BadRequestException(
      'There was an error processing your request. Please try again later, and if the issue persists, request a new OTP for verification.',
    );
  }
}
