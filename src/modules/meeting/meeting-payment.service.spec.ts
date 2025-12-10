import mongoose, { Model } from 'mongoose';
import { MeetingPaymentService } from './meeting-payment.service';
import { Meeting } from './schemas/meeting.schema';
import { Payment } from '../payment/schemas/payment.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOverrideDto } from './dto/create.meeting.dto';
import { UpdateOverrideDto } from './dto/update.meeting.dto';

const mockMeeting = {
  _id: '64fca2dee3109bd3b9402302',
  meetingType: 'ONLINE',
  organizer: '64f828ff0caa679436efeb8d',
  internalName: 'My Counselling Sessions for the Week',
  description: 'some text',
  scheduling: {
    title: 'Calendar page title',
    description: 'Description to display on Calendar page',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64fca2dee3109bd3b9402303',
    notifications: [
      {
        type: 'EMAIL',
        enable: true,
        template: '64fd6800f2f35ae2f158c566',
        remark: 'Booking confirmation email',
        sendBefore: -1,
        _id: '64fd6dded382be8dd776ac14',
      },
    ],
    durationOptions: [
      {
        hours: 1,
        mins: 15,
        display: '1 Hr 15Mins',
        _id: '64fd775a373f2fba7f46480a',
      },
    ],
    schedule: [
      {
        type: 'EVERYDAY',
        startTime: '1500',
        endTime: '1600',
        room: ['64fa03a2dde54719125a7efa'],
        _id: '64fd79701eaafc83d0da3c6f',
      },
    ],
  },
};

const mockUpdatedMeeting = {
  _id: '64e49224bf1050a5e3327c35',
  meetingType: 'ONLINE',
  organizer: '64db4fed192a47efa0ea9838',
  internalName: 'My Counselling Sessions for the Week',
  description: 'Some',
  scheduling: {
    title: 'Calendar page title',
    description: 'Description to display on Calendar page',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64e49224bf1050a5e3327c36',
    notifications: [
      {
        type: 'EMAIL',
        enable: true,
        template: '64d4959011f16b3c3d31c864',
        remark: 'Booking confirmation email',
        sendBefore: -1,
        _id: '64e49316bf1050a5e3327c41',
      },
    ],
    durationOptions: [
      {
        hours: 1,
        mins: 15,
        display: '1 Hr 15Mins',
        _id: '64e493d5bf1050a5e3327c44',
      },
    ],
    schedule: [
      {
        type: 'EVERYDAY',
        startTime: '1500',
        endTime: '1600',
        room: ['64e4e17bc42d225f28939a7e'],
        _id: '64e4e18bc42d225f28939a84',
      },
    ],
  },
  payment: {
    available: ['64e6466fe017820e3d0fc62c'],
    overrides: [],
    _id: '64e646cbe017820e3d0fc637',
  },
};

const mockCreatedPaymentOverrideMeeting = {
  _id: '64e49224bf1050a5e3327c35',
  meetingType: 'ONLINE',
  organizer: '64db4fed192a47efa0ea9838',
  internalName: 'My Counselling Sessions for the Week',
  description: 'Some',
  scheduling: {
    title: 'Calendar page title',
    description: 'Description to display on Calendar page',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64e49224bf1050a5e3327c36',
    notifications: [
      {
        type: 'EMAIL',
        enable: true,
        template: '64d4959011f16b3c3d31c864',
        remark: 'Booking confirmation email',
        sendBefore: -1,
        _id: '64e49316bf1050a5e3327c41',
      },
    ],
    durationOptions: [
      {
        hours: 1,
        mins: 15,
        display: '1 Hr 15Mins',
        _id: '64e493d5bf1050a5e3327c44',
      },
    ],
    schedule: [
      {
        type: 'EVERYDAY',
        startTime: '1500',
        endTime: '1600',
        room: ['64e4e17bc42d225f28939a7e'],
        _id: '64e4e18bc42d225f28939a84',
      },
    ],
  },
  payment: {
    available: ['64e6466fe017820e3d0fc62c'],
    _id: '64e6d5eb35a9b2b27e44ca67',
    overrides: [
      {
        _id: '64e6466fe017820e3d0fc62c',
        name: 'Bank Transfer',
        enable: true,
        description: 'Please make a payment to below account',
        additionalInfo: 'Bank details',
      },
    ],
  },
};

// const mockUpdatedPaymentOverrideMeeting = {
//   _id: '64e49224bf1050a5e3327c35',
//   meetingType: 'ONLINE',
//   organizer: '64db4fed192a47efa0ea9838',
//   internalName: 'My Counselling Sessions for the Week',
//   description: 'Some',
//   scheduling: {
//     title: 'Calendar page title',
//     description: 'Description to display on Calendar page',
//     enablePayments: true,
//     timezone: 'GMT+5.30',
//     _id: '64e49224bf1050a5e3327c36',
//     notifications: [
//       {
//         type: 'EMAIL',
//         enable: true,
//         template: '64d4959011f16b3c3d31c864',
//         remark: 'Booking confirmation email',
//         sendBefore: -1,
//         _id: '64e49316bf1050a5e3327c41',
//       },
//     ],
//     durationOptions: [
//       {
//         hours: 1,
//         mins: 15,
//         display: '1 Hr 15Mins',
//         _id: '64e493d5bf1050a5e3327c44',
//       },
//     ],
//     schedule: [
//       {
//         type: 'EVERYDAY',
//         startTime: '1500',
//         endTime: '1600',
//         room: ['64e4e17bc42d225f28939a7e'],
//         _id: '64e4e18bc42d225f28939a84',
//       },
//     ],
//   },
//   payment: {
//     available: ['64e6466fe017820e3d0fc62c'],
//     _id: '64e6d5eb35a9b2b27e44ca67',
//     overrides: [
//       {
//         _id: '64e6466fe017820e3d0fc62c',
//         name: 'Bank Transfer',
//         enable: true,
//         description: 'Please make a payment to below account',
//         additionalInfo: 'Bank details',
//       },
//     ],
//   },
// };

describe('MeetingPaymentService', () => {
  let meetingPaymentService: MeetingPaymentService;
  let meetingModel: Model<Meeting>;
  let paymentModel: Model<Payment>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingPaymentService,
        {
          provide: getModelToken(Meeting.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
            findById: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getModelToken(Payment.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    meetingPaymentService = module.get<MeetingPaymentService>(
      MeetingPaymentService,
    );
    meetingModel = module.get<Model<Meeting>>(getModelToken(Meeting.name));
    paymentModel = module.get<Model<Payment>>(getModelToken(Payment.name));
  });

  it('should be defined', () => {
    expect(meetingPaymentService).toBeDefined();
  });

  describe('addNewPaymentOptionToMeeting', () => {
    const mockPaymentOption = {
      _id: '64e61e57bbe560bfeb63cdae',
      name: 'Cash at Session',
      description: 'Pay by cash before/after the session',
      enabled: true,
    };

    it('should add a new Payment Option to Meeting and return updated Meeting', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest
        .spyOn(paymentModel, 'findById')
        .mockResolvedValueOnce(mockPaymentOption);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedMeeting),
      } as any);
      const updatedMeeting = await meetingPaymentService.addOption(
        mockMeeting._id,
        mockPaymentOption._id,
      );

      expect(updatedMeeting).toEqual(mockUpdatedMeeting);
    });

    it('should throw BadRequestException if Payment Option is desabled', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      const mockPaymentOption = {
        _id: '64e61e57bbe560bfeb63cdae',
        name: 'Cash at Session',
        description: 'Pay by cash before/after the session',
        enabled: false,
      };

      jest
        .spyOn(paymentModel, 'findById')
        .mockResolvedValueOnce(mockPaymentOption);

      await expect(
        meetingPaymentService.addOption(mockMeeting._id, mockPaymentOption._id),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if Payment Option is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest.spyOn(paymentModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.addOption(mockMeeting._id, mockPaymentOption._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Payment Option ID is not valid', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidPaymentOptionObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.addOption(mockMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidPaymentOptionObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.addOption(mockMeeting._id, mockPaymentOption._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Meeting ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.addOption(id, mockPaymentOption._id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });
  });

  describe('removePaymentOption', () => {
    it('should remove a Payment Option from Meeting Availble and return updated Meeting', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest
        .spyOn(meetingModel, 'findOne')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);
      const updatedMeeting = await meetingPaymentService.removeOption(
        mockUpdatedMeeting._id,
        '64e6466fe017820e3d0fc62c',
      );

      expect(updatedMeeting).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if Payment option not in Meeting Avaible array', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findOne').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.removeOption(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Payment option ID is not valid', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidPaymentOptionObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.removeOption(mockUpdatedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidPaymentOptionObjectId.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.removeOption(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Meeting ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.removeOption(mockUpdatedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });
  });

  describe('createNewPaymentOverride', () => {
    const mockCreatedOverrideDto: CreateOverrideDto = {
      name: 'Bank Transfer',
      enable: true,
      description: 'Please make a payment to below account',
      additionalInfo: 'Bank details',
    };

    it('should create new Payment Override and return updated Meeting', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest
        .spyOn(meetingModel, 'findOne')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce(mockCreatedPaymentOverrideMeeting),
      } as any);
      const updatedMeeting = await meetingPaymentService.create(
        mockUpdatedMeeting._id,
        '64e6466fe017820e3d0fc62c',
        mockCreatedOverrideDto as CreateOverrideDto,
      );

      expect(updatedMeeting).toEqual(mockCreatedPaymentOverrideMeeting);
    });

    it('should throw NotFoundException if Payment Option is not found', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findOne').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.create(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
          mockCreatedOverrideDto as CreateOverrideDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Payment Option ID is not valid', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      jest
        .spyOn(meetingModel, 'findOne')
        .mockResolvedValueOnce(mockUpdatedMeeting);
      const id = 'invalid-id';
      const isValidPaymentOptionObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.create(
          mockUpdatedMeeting._id,
          id,
          mockCreatedOverrideDto as CreateOverrideDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidPaymentOptionObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });

    it('should throw NotFoundException if Meeing is not Avalible', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.create(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
          mockCreatedOverrideDto as CreateOverrideDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Meeting ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.create(
          id,
          '64e6466fe017820e3d0fc62c',
          mockCreatedOverrideDto as CreateOverrideDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });
  });

  // describe('updatePaymentOverride', () => {
  //   const mockUpdatedOverrideDto: UpdateOverrideDto = {
  //     name: 'Bank Transfer',
  //     enable: true,
  //     description: 'Please make a payment to below account',
  //     additionalInfo: 'Bank details',
  //   };

  //   it('should update a Payment Override and return updated Meeting', async () => {
  //     jest
  //       .spyOn(meetingModel, 'findOne')
  //       .mockResolvedValueOnce(mockUpdatedMeeting);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValueOnce(mockUpdatedPaymentOverrideMeeting),
  //     } as any);
  //     const updatedMeeting = await meetingPaymentService.update(
  //       mockCreatedPaymentOverrideMeeting._id,
  //       '64e6466fe017820e3d0fc62c',
  //       mockUpdatedOverrideDto as UpdateOverrideDto,
  //     );

  //     expect(updatedMeeting).toEqual(mockUpdatedPaymentOverrideMeeting);
  //   });

  //   it('should throw NotFoundException if Meeting is not found', async () => {
  //     jest
  //       .spyOn(meetingModel, 'findOne')
  //       .mockResolvedValueOnce(mockUpdatedMeeting);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(null),
  //     } as any);

  //     await expect(
  //       meetingPaymentService.update(
  //         mockUpdatedMeeting._id,
  //         '64e6466fe017820e3d0fc62c',
  //         mockUpdatedOverrideDto as UpdateOverrideDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if Meeting ID is not valid', async () => {
  //     jest
  //       .spyOn(meetingModel, 'findOne')
  //       .mockResolvedValueOnce(mockUpdatedMeeting);
  //     const isValidPaymentOptionObjectId = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValueOnce(true);

  //     const id = 'invalid-id';
  //     const isValidMeetingObjectId = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingPaymentService.update(
  //         id,
  //         '64e6466fe017820e3d0fc62c',
  //         mockUpdatedOverrideDto as UpdateOverrideDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidPaymentOptionObjectId.mockRestore();
  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidMeetingObjectId.mockRestore();
  //   });

  //   it('should throw NotFoundException if Payment Option is not Avalible', async () => {
  //     jest.spyOn(meetingModel, 'findOne').mockResolvedValueOnce(null);

  //     await expect(
  //       meetingPaymentService.update(
  //         mockUpdatedMeeting._id,
  //         '64e6466fe017820e3d0fc62c',
  //         mockUpdatedOverrideDto as UpdateOverrideDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if Payment Option ID is not valid', async () => {
  //     const id = 'invalid-id';
  //     const isValidPaymentOptionObjectId = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingPaymentService.update(
  //         mockUpdatedMeeting._id,
  //         id,
  //         mockUpdatedOverrideDto as UpdateOverrideDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidPaymentOptionObjectId.mockRestore();
  //   });
  // });

  describe('removePaymentOverride', () => {
    it('should remove a Payment Override and return updated Meeting', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest
        .spyOn(meetingModel, 'findOne')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);
      const updatedMeeting = await meetingPaymentService.remove(
        mockUpdatedMeeting._id,
        '64e6466fe017820e3d0fc62c',
      );

      expect(updatedMeeting).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if Payment Option overrides is not found', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findOne').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.remove(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Payment Option overrides ID is not valid', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidPaymentOptionObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.remove(mockUpdatedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidPaymentOptionObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not Avalible', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingPaymentService.remove(
          mockUpdatedMeeting._id,
          '64e6466fe017820e3d0fc62c',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Meeting ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingPaymentService.remove(mockUpdatedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });
  });
});
