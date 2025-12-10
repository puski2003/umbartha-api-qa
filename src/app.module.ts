import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CounsellorModule } from './modules/counsellor/counsellor.module';
import { ServiceModule } from './modules/service/service.module';
import { HealthModule } from './health/health.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { LocationModule } from './modules/location/location.module';
import { MeetingModule } from './modules/meeting/meeting.module';
import { DataFormModule } from './modules/data-form/data-form.module';
import { ClientModule } from './modules/client/client.module';
import { AuthorizationModule } from './config/authorization/authorization.module';
import { PublicCounsellorModule } from './modules/public/public-counsellor/public-counsellor.module';
import { PublicMeetingModule } from './modules/public/public-meeting/public-meeting.module';
import { PublicCouponModule } from './modules/public/public-coupon/public-coupon.module';
import { PublicClientModule } from './modules/public/public-client/public-client.module';
import { EventModule } from './modules/event/event.module';
import { PublicContactModule } from './modules/public/public-contact/public-contact.module';
import { PublicFaqModule } from './modules/public/public-faq/public-faq.module';
import { FaqModule } from './modules/faq/faq.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { PublicSubscriptionModule } from './modules/public/public-subscription/public-subscription.module';
import { TestimonialModule } from './modules/testimonial/testimonial.module';
import { PublicTestimonialModule } from './modules/public/public-testimonial/public-testimonial.module';
import { PublicEventModule } from './modules/public/public-event/public-event.module';
import { PublicServiceModule } from './modules/public/public-service/public-service.module';
import { PublicGalleryModule } from './modules/public/public-gallery/public-gallery.module';
import { MeetingBookingModule } from './modules/meeting.booking/meeting.booking.module';
import { BookingPaymentModule } from './modules/booking.payment/booking.payment.module';
import { CounsellorRateModule } from './modules/counsellor.rate/counsellor.rate.module';
import { S3Module } from './config/aws/aws-s3/module';
import { SESModule } from './config/aws/aws-ses/module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { LocationReservationModule } from './modules/location.reservation/location.reservation.module';
import { PublicOtpModule } from './modules/public/public-otp/public-otp.module';
import { PublicBookingPaymentModule } from './modules/public/public-booking.payment/public-booking.payment.module';
import { PublicScheduleModule } from './modules/public/public-schedule/public-schedule.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { ImageModule } from './config/common/image.placeholder/image.module';
import { PayitForwardModule } from './modules/payit-forward/payit-forward.module';
import { PublicPayitForwardModule } from './modules/public/public-payit-forward/public-payit-forward.module';
import { ReCaptchaModule } from './config/re-captcha/re-captcha.module';
import { SMSModule } from './config/sms/sms.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentOptionModule } from './modules/payment.option/payment.option.module';
import { NotificationTemplateModule } from './modules/notification.template/notification.template.module';
import { MicrosoftGraphModule } from './config/microsoft-graph/microsoft-graph.module';
import { TimezoneModule } from './config/common/timezone/timezone.module';
import { PaypalModule } from './config/paypal/paypal.module';
import { GoogleModule } from './config/google/google.module';
import { CourseModule } from './modules/course/course.module';
import { QuestionModule } from './modules/question/question.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    CounsellorModule,
    ServiceModule,
    HealthModule,
    PaymentOptionModule,
    CouponModule,
    LocationModule,
    MeetingModule,
    DataFormModule,
    ClientModule,
    AuthorizationModule,
    PublicCounsellorModule,
    PublicMeetingModule,
    PublicCouponModule,
    PublicClientModule,
    SMSModule,
    EventModule,
    PublicContactModule,
    PublicFaqModule,
    FaqModule,
    SubscriptionModule,
    PublicSubscriptionModule,
    TestimonialModule,
    PublicTestimonialModule,
    PublicEventModule,
    PublicServiceModule,
    PublicGalleryModule,
    MeetingBookingModule,
    BookingPaymentModule,
    CounsellorRateModule,
    S3Module,
    SESModule,
    ScheduleModule,
    LocationReservationModule,
    PublicOtpModule,
    PublicBookingPaymentModule,
    PublicScheduleModule,
    GalleryModule,
    ImageModule,
    PayitForwardModule,
    PublicPayitForwardModule,
    ReCaptchaModule,
    SMSModule,
    NotificationModule,
    NotificationTemplateModule,
    MicrosoftGraphModule,
    TimezoneModule,
    PaypalModule,
    PaypalModule,
    GoogleModule,
    CourseModule,
    QuestionModule,
  ],
})
export class AppModule {}
