import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BOOKING_PAYMENT_COLLECTION } from './booking.payment.constants';
import { Model, Types } from 'mongoose';
import {
  BookingPayment,
  BookingPaymentStatus,
  PaypalStatus,
} from './schema/booking.payment.schema';
import { isEmpty, isNotEmpty } from 'class-validator';
import { BookingPaymentQueryI, InstallmentI } from './booking.payment.types';
import { CouponService } from '../coupon/coupon.service';
import { Coupon } from '../coupon/schemas/coupon.schema';
import { User } from 'src/config/authorization/user.decorator';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import * as CC from 'currency-converter-lt';
import { PaymentOptionService } from '../payment.option/payment.option.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/schema/notification.schema';
import { format } from 'date-fns';
import { MEETING_BOOKING_COLLECTION } from '../meeting.booking/meeting.booking.constants';
import { MeetingBooking } from '../meeting.booking/schema/meeting.booking.schema';

const T = {
  bookingPaymentNotFound: 'booking payment is not found',
  excessPayment: 'entered amount is larger than the required amount',
  paymentAlreadyCompleted: 'booking payment is already completed',
};

@Injectable()
export class BookingPaymentService {
  private currencyConverter = new CC();

  constructor(
    @InjectModel(BOOKING_PAYMENT_COLLECTION)
    private readonly bookingPaymentModel: Model<BookingPayment>,
    @InjectModel(COUNSELLOR_COLLECTION)
    private readonly counsellorModel: Model<Counsellor>,
    private readonly paymentMethod: PaymentOptionService,
    private readonly coupon: CouponService,
    private readonly notificationService: NotificationService,
    @InjectModel(MEETING_BOOKING_COLLECTION)
    private readonly meetingBookingModel: Model<MeetingBooking>,
  ) {}

  async findAll(
    search: string,
    limit: number,
    page: number,
    user: User,
    query: BookingPaymentQueryI,
  ) {
    const filter: any = {};
    if (
      !user.isSuperAdmin &&
      !user.isAdmin &&
      user.isCounsellor &&
      isNotEmpty(user.counsellor)
    )
      filter.counsellor = new Types.ObjectId(user.counsellor);

    if (isNotEmpty(search)) {
      /**
       * Split the search string
       */
      const parts = search.split(':');

      /**
       * Extract the last part as the value
       */
      const value = parts.pop();

      /**
       * Escape special characters in the value for use in regex
       */
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      /**
       * Construct the key path for the filter without the last part
       */
      const keyPath = parts.join('.');

      filter[keyPath] = { $regex: escapedValue, $options: 'i' };
    }

    if (isNotEmpty(query.status)) {
      if (query.status === 'COMPLETED') {
        filter.completed = true;
        filter.status = BookingPaymentStatus.PAID;
      } else if (query.status === 'PENDING') {
        filter.completed = false;
        filter.status = BookingPaymentStatus.PROCESSING;
      } else if (query.status === BookingPaymentStatus.CANCELLED) {
        filter.status = BookingPaymentStatus.CANCELLED;
      }
    }

    if (isNotEmpty(query.dateFrom) || isNotEmpty(query.dateTo)) {
      if (isNotEmpty(query.dateFrom))
        filter.updatedAt = {
          $gte: query.dateFrom,
        };

      if (isNotEmpty(query.dateTo))
        filter.updatedAt = {
          $lte: query.dateTo,
        };

      if (isNotEmpty(query.dateFrom) && isNotEmpty(query.dateTo))
        filter.updatedAt = {
          $gte: query.dateFrom,
          $lte: query.dateTo,
        };
    }

    const totalDocs = await this.bookingPaymentModel.countDocuments({
      paymentOption: { $exists: true, $ne: null },
      ...filter,
    });
    const totalPages = Math.ceil(totalDocs / limit);

    const bookingPaymentCheck = await this.bookingPaymentModel
      .find({
        status: { $ne: BookingPaymentStatus.PENDING },
        ...filter,
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1))
      .populate([
        { path: 'client', select: 'name phone email' },
        {
          path: 'counsellor',
          select:
            'profilePictureURL title displayName specialization email mobile hotline',
        },
        { path: 'meeting', select: 'meetingType internalName description' },
        { path: 'room', select: 'name' },
        { path: 'paymentOption', select: 'name description' },
        { path: 'installments.paymentMethod', select: 'name description' },
        { path: 'installments.coupon', select: 'name discountType amount' },
        { path: 'meetingBooking', select: 'timeFrom timeTo status' },
      ])
      .lean();

    return {
      docs: bookingPaymentCheck,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: limit,
        nextPage: page + 1,
        page: page,
        prevPage: page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  async findById(bookingPayment: string) {
    const bookingPaymentCheck = await this.bookingPaymentModel
      .findById(bookingPayment)
      .lean()
      .populate([
        { path: 'client', select: 'name phone email' },
        {
          path: 'counsellor',
          select:
            'profilePictureURL title displayName specialization email mobile hotline',
        },
        { path: 'meeting', select: 'meetingType internalName description' },
        { path: 'room', select: 'name' },
        { path: 'paymentOption' },
        { path: 'installments.paymentMethod', select: 'name description' },
        { path: 'installments.coupon', select: 'name discountType amount' },
        { path: 'meetingBooking', select: 'timeFrom timeTo' },
      ]);

    if (isEmpty(bookingPaymentCheck))
      throw new NotFoundException(T.bookingPaymentNotFound);

    return bookingPaymentCheck;
  }

  async deleteSelectedBookingPayment(bookingPayment: string) {
    await this.findById(bookingPayment);

    const deletedBookingPayment =
      await this.bookingPaymentModel.findByIdAndRemove(bookingPayment);

    return deletedBookingPayment;
  }

  async bookingPaymentStatusChange(
    bookingPayment: string,
    status: string,
  ): Promise<any> {
    await this.findById(bookingPayment);

    const updatedBooingPayment =
      await this.bookingPaymentModel.findByIdAndUpdate(
        bookingPayment,
        { status },
        { new: true, lean: true },
      );

    if (status === BookingPaymentStatus.CANCELLED)
      await this.meetingBookingModel.findByIdAndUpdate(
        updatedBooingPayment.meeting,
        { status: BookingPaymentStatus.CANCELLED },
        { new: true, lean: true },
      );

    return updatedBooingPayment;
  }

  async addingInstallments(
    bookingPaymentId: string,
    installment: InstallmentI,
  ) {
    const bookingPaymentCheck = await this.findById(bookingPaymentId);

    if (
      bookingPaymentCheck.completed &&
      bookingPaymentCheck.status === BookingPaymentStatus.PROCESSING
    )
      throw new BadRequestException(T.paymentAlreadyCompleted);

    await this.paymentMethod.findById(installment.paymentMethod);

    let couponCheck: Coupon;
    if (!!installment.coupon) {
      couponCheck = await this.coupon.findByCouponName(installment.coupon);

      couponCheck.amount = await this.currencyConverter
        .from('LKR')
        .to(bookingPaymentCheck.currency)
        .amount(couponCheck.amount)
        .convert();

      installment.installmentPayment =
        installment.installmentPayment + couponCheck.amount;
    }

    if (bookingPaymentCheck.amount < installment.installmentPayment)
      throw new BadRequestException(T.excessPayment);

    const updatedAmount =
      bookingPaymentCheck.amount - installment.installmentPayment;

    const updatedBookingPayment = await this.bookingPaymentModel
      .findByIdAndUpdate(
        bookingPaymentId,
        {
          $set: {
            amount: updatedAmount,
            paid:
              (bookingPaymentCheck.paid || 0) + installment.installmentPayment,
          },
          $push: {
            installments: {
              ...installment,
              paymentMethod: new Types.ObjectId(installment.paymentMethod),
              coupon: new Types.ObjectId(couponCheck?._id),
            },
          },
        },
        { new: true, lean: true },
      )
      .then(async (d) => {
        if (!!installment.coupon)
          await this.coupon.couponUse(installment.coupon);

        if (d.amount == 0) {
          const updatedBookingPayment: any = await this.bookingPaymentModel
            .findByIdAndUpdate(
              bookingPaymentId,
              { $set: { completed: true, status: BookingPaymentStatus.PAID } },
              { new: true, lean: true },
            )
            .populate('client');

          if (!updatedBookingPayment.client?.notificationType?.email === true) {
            const paymentData = {
              CustomerName: updatedBookingPayment.client.name,
              TransactionID: updatedBookingPayment._id,
              PaidAmount: `${updatedBookingPayment.currency} ${updatedBookingPayment.paid}`,
              ContactInformation: 'info@umbartha.org',
              YearOngoing: format(new Date(), 'yyyy'),
            };

            await this.notificationService.sendNotification(
              '6687902467a4a0f353dde94d',
              NotificationType.EMAIL,
              [updatedBookingPayment.client.email.toLowerCase()],
              'Payment Success Confirmation',
              paymentData,
            );
          }

          return updatedBookingPayment;
        }

        return d;
      });

    return updatedBookingPayment;
  }

  async addCoupon(bookingPaymentId: string, couponName: string) {
    const bookingPaymentCheck = await this.findById(bookingPaymentId);

    if (
      bookingPaymentCheck.completed &&
      bookingPaymentCheck.status === BookingPaymentStatus.PROCESSING
    ) {
      throw new BadRequestException(T.paymentAlreadyCompleted);
    }

    const couponCheck = await this.coupon.findByCouponName(couponName);
    couponCheck.amount = await this.currencyConverter
      .from('LKR')
      .to(bookingPaymentCheck.currency)
      .amount(couponCheck.amount)
      .convert();

    if (bookingPaymentCheck.amount < couponCheck.amount) {
      throw new BadRequestException(T.excessPayment);
    }

    const updatedAmount = bookingPaymentCheck.amount - couponCheck.amount;

    const updatedBookingPayment = await this.bookingPaymentModel
      .findByIdAndUpdate(
        bookingPaymentId,
        {
          $set: {
            amount: updatedAmount,
            paid: (bookingPaymentCheck.paid || 0) + couponCheck.amount,
          },
          $push: {
            installments: { coupon: new Types.ObjectId(couponCheck?._id) },
          },
        },
        { new: true, lean: true },
      )
      .then(async (d) => {
        await this.coupon.couponUse(couponName);

        if (d.amount == 0) {
          const updatedBookingPayment: any = await this.bookingPaymentModel
            .findByIdAndUpdate(
              bookingPaymentId,
              { $set: { completed: true, status: BookingPaymentStatus.PAID } },
              { new: true, lean: true },
            )
            .populate('client');

          if (updatedBookingPayment.client?.notificationType?.email === true) {
            const paymentData = {
              CustomerName: updatedBookingPayment.client.name,
              TransactionID: updatedBookingPayment._id,
              PaidAmount: updatedBookingPayment.amount,
            };

            await this.notificationService.sendNotification(
              '6687902467a4a0f353dde94d',
              NotificationType.EMAIL,
              [updatedBookingPayment.client.email.toLowerCase()],
              'Payment Success Confirmation',
              paymentData,
            );
          }

          return updatedBookingPayment;
        }
        return d;
      });

    return updatedBookingPayment;
  }

  async paymentGraphData(user) {
    const filter: any = {};
    if (!user.isSuperAdmin && !user.isAdmin) {
      const counsellorCheck = await this.counsellorModel
        .findOne({
          userId: user.user,
        })
        .lean();

      filter.counsellor = new Types.ObjectId(counsellorCheck._id);
    }

    const completedCount = await this.bookingPaymentModel.count({
      ...filter,
      paymentOption: { $exists: true, $ne: null },
      completed: true,
      status: BookingPaymentStatus.PAID,
    });

    const pendingCount = await this.bookingPaymentModel.count({
      ...filter,
      paymentOption: { $exists: true, $ne: null },
      completed: false,
    });

    return [completedCount, pendingCount];
  }

  async updatePaymentWithPaypal(id: string, paypalDetails: any) {
    const objectId = new Types.ObjectId(id);

    const updateFields: any = {};

    if (
      paypalDetails.status &&
      Object.values(PaypalStatus).includes(paypalDetails.status)
    ) {
      updateFields['paypal.status'] = paypalDetails.status;
    } else if (paypalDetails.status) {
      throw new BadRequestException('Invalid PayPal status');
    }

    if (paypalDetails.orderId)
      updateFields['paypal.orderId'] = paypalDetails.orderId;
    if (paypalDetails.createTime)
      //   updateFields['paypal.createTime'] = paypalDetails.createTime;
      // if (paypalDetails.status)
      //   updateFields['paypal.status'] = paypalDetails.status;
      // if (paypalDetails.approveUrl)
      //   updateFields['paypal.approveUrl'] = paypalDetails.approveUrl;
      // if (paypalDetails.captureId)
      updateFields['paypal.captureId'] = paypalDetails.captureId;
    if (paypalDetails.amount)
      updateFields['paypal.amount'] = paypalDetails.amount;
    if (paypalDetails.currency)
      updateFields['paypal.currency'] = paypalDetails.currency;
    if (paypalDetails.payer) updateFields['paypal.payer'] = paypalDetails.payer;

    const bookingPayment = await this.bookingPaymentModel.findByIdAndUpdate(
      objectId,
      {
        $set: updateFields,
        // $push: {'paypal.status': paypalDetails.statu},
      },
      { new: true },
    );

    if (!bookingPayment) {
      throw new NotFoundException('Booking payment not found');
    }

    console.log(`document ${id} updated with ${JSON.stringify(paypalDetails)}`);
    return bookingPayment;
  }
}
