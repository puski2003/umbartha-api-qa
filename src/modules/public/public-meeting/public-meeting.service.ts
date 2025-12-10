import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isEmpty } from 'class-validator';
import { Model } from 'mongoose';
import { BookingPaymentService } from 'src/modules/booking.payment/booking.payment.service';
import { ClientService } from 'src/modules/client/client.service';
import { ClientExsisted } from 'src/modules/client/schemas/client.schema';
import { TargetAudience } from 'src/modules/data-form/schemas/data-form.schema';
import { MeetingBookingService } from 'src/modules/meeting.booking/meeting.booking.service';
import { MeetingBookingStatus } from 'src/modules/meeting.booking/schema/meeting.booking.schema';
import { MeetingService } from 'src/modules/meeting/meeting.service';
import {
  Meeting,
  MeetingType,
} from 'src/modules/meeting/schemas/meeting.schema';

const T = {
  dataFormNotFound: 'meeeting linked data form is not found',
  availableOptionNotFound: 'meeting available payment option is not found',
};

@Injectable()
export class PublicMeetingService {
  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<Meeting>,
    private readonly meetingService: MeetingService,
    private readonly clientService: ClientService,
    private readonly meetingBookingService: MeetingBookingService,
    private readonly bookingPaymentService: BookingPaymentService,
  ) {}

  async getDataForm(meetingId: string, email: string) {
    await this.meetingService.findSelectedMeeting(meetingId);

    const filter: any = {};

    await this.clientService.findClientUseEmail(email).then(async (d) => {
      if (isEmpty(d)) throw new NotFoundException('client is not found');

      if (d.exsisted === ClientExsisted.NEW) filter.target = TargetAudience.NEW;
      else filter.target = TargetAudience.EXISTED;
    });

    const dataFormCheck = await this.meetingModel
      .findById(meetingId, {
        forms: 1,
      })
      .populate('forms.linkedForms.form')
      .lean();

    if (isEmpty(dataFormCheck)) {
      throw new NotFoundException(T.dataFormNotFound);
    }

    const filteredForm = dataFormCheck?.forms?.linkedForms.filter((d: any) => {
      return (
        d.form.target === TargetAudience.ALL || d.form.target === filter.target
      );
    });
    dataFormCheck?.forms?.linkedForms.sort((a, b) => a.order - b.order);

    for (let i = 0; i < dataFormCheck?.forms?.linkedForms.length; i++) {
      const form: any = dataFormCheck?.forms?.linkedForms[i].form;

      form.data.sort((a, b) => a.order - b.order);
    }

    return {
      ...(!dataFormCheck?.forms
        ? { forms: { linkedForms: [] } }
        : { forms: { linkedForms: filteredForm } }),
    };
  }

  async getPaymentMethod(meetingId: string, meetingType: string) {
    await this.meetingService.findSelectedMeeting(meetingId);

    const availableOption = await this.meetingModel
      .findById(meetingId, {
        payment: 1,
      })
      .lean();

    availableOption.payment.overrides =
      availableOption.payment.overrides.reduce((acc, override) => {
        if (
          override.meetingType === meetingType ||
          override.meetingType === MeetingType.BOTH
        )
          acc.push(override);

        return acc;
      }, []);

    if (isEmpty(availableOption)) {
      throw new NotFoundException(T.availableOptionNotFound);
    }
    return availableOption;
  }

  async getBookingSummery(meetingBooking: string, bookingPayment: string) {
    const meetingBookingCheck = await this.meetingBookingService.findById(
      meetingBooking,
    );

    const bookingPaymentCheck = await this.bookingPaymentService.findById(
      bookingPayment,
    );

    return { booking: meetingBookingCheck, payment: bookingPaymentCheck };
  }
}
