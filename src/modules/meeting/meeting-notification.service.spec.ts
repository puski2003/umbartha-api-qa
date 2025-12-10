import mongoose, { Model } from 'mongoose';
import { MeetingNotificationService } from './meeting-notification.service';
import { Meeting } from './schemas/meeting.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Template } from '../template/schemas/template.schema';
import { CreateMeetingNotificationDto } from './dto/create.meeting.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockMeeting = {
  _id: '64e49224bf1050a5e3327c35',
  meetingType: 'ONLINE',
  organizer: '64db4fed192a47efa0ea9838',
  internalName: 'My Counselling Sessions for the Week',
  description: 'some text',
  scheduling: {
    title: 'Calendar page title',
    description: 'Description to display on Calendar page',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64e49224bf1050a5e3327c36',
    notifications: [],
    durationOptions: [],
    schedule: [],
  },
};

const mockNotificationAddedMeeting = {
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
    notifications: [],
    durationOptions: [],
    schedule: [],
  },
};

// const mockUpdatedMeeting = {
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
//     durationOptions: [],
//     schedule: [],
//   },
// };

describe('MeetingNotificationService', () => {
  let meetingNotificationService: MeetingNotificationService;
  let meetingModel: Model<Meeting>;
  let notificationModel: Model<Template>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingNotificationService,
        {
          provide: getModelToken(Meeting.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
            findById: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Template.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    meetingNotificationService = module.get<MeetingNotificationService>(
      MeetingNotificationService,
    );
    meetingModel = module.get<Model<Meeting>>(getModelToken(Meeting.name));
    notificationModel = module.get<Model<Template>>(
      getModelToken(Template.name),
    );
  });

  it('should be definde', () => {
    expect(meetingNotificationService).toBeDefined();
  });

  describe('addNewMeetingNotification', () => {
    const notification = {
      type: 'SMS',
      name: 'Booking Confirmation Template',
      template: 'long text',
      _id: '64fd6800f2f35ae2f158c566',
      __v: 0,
    };

    const mockMeetingNotificationDto: CreateMeetingNotificationDto = {
      type: 'EMAIL',
      enable: true,
      template: '64b8af91de9b68ab608c03b2',
      remark: 'Booking confirmation email',
      sendBefore: -1,
    };

    it('should add a New Meeting Notification to Meeting and return updated Meeting', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest
        .spyOn(notificationModel, 'findById')
        .mockResolvedValueOnce(notification);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockNotificationAddedMeeting),
      } as any);
      const updatedMeeting =
        await meetingNotificationService.addNotificationForMeeting(
          mockMeeting._id,
          mockMeetingNotificationDto as CreateMeetingNotificationDto,
        );

      expect(updatedMeeting).toEqual(mockNotificationAddedMeeting);
    });

    it('should throw NotFoundException if Notification Template is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingNotificationService.addNotificationForMeeting(
          mockMeeting._id,
          mockMeetingNotificationDto as CreateMeetingNotificationDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Notification Template ID is given', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      const isValidMeetingObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(true);
      const isValidNotificationTemplateObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingNotificationService.addNotificationForMeeting(
          mockMeeting._id,
          mockMeetingNotificationDto as CreateMeetingNotificationDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidNotificationTemplateObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingNotificationService.addNotificationForMeeting(
          mockMeeting._id,
          mockMeetingNotificationDto as CreateMeetingNotificationDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting ID is given', async () => {
      const id = 'invalid-id';
      const isValidMeetingObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingNotificationService.addNotificationForMeeting(
          id,
          mockMeetingNotificationDto as CreateMeetingNotificationDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectIdMock.mockRestore();
    });
  });

  // describe('UpdateNotificationInMeeting', () => {
  //   const mockMeetingNotificationDto: UpdateMeetingNotificationDto = {
  //     type: 'SMS',
  //     enable: true,
  //     template: '64b8af91de9b68ab608c03b2',
  //     remark: 'Booking confirmation SMS updated',
  //     sendBefore: -1,
  //   };

  //   it('should update a Meeting Notification in Meeting and return updated Meeting', async () => {
  //     jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(mockUpdatedMeeting),
  //     } as any);
  //     const updatedMeeting = await meetingNotificationService.update(
  //       mockMeeting._id,
  //       '64b8af91de9b68ab608c03b2',
  //       mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //     );

  //     expect(updatedMeeting).toEqual(mockUpdatedMeeting);
  //   });

  //   it('should throw NotFoundException if notification is not found in Meeting', async () => {
  //     jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(null),
  //     } as any);

  //     await expect(
  //       meetingNotificationService.update(
  //         mockMeeting._id,
  //         '64b8af91de9b68ab608c03b2',
  //         mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw NotFoundException if Meeting is not found', async () => {
  //     jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

  //     await expect(
  //       meetingNotificationService.update(
  //         mockMeeting._id,
  //         '64b8af91de9b68ab608c03b2',
  //         mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if invalid Meeting ID is given', async () => {
  //     jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(true);
  //     const isValidNotificationTempleteObjectIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValueOnce(true);

  //     const id = 'invalid-id';

  //     const isValidMeetingObjectIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingNotificationService.update(
  //         id,
  //         '64b8af91de9b68ab608c03b2',
  //         mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidNotificationTempleteObjectIdMock.mockRestore();
  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidMeetingObjectIdMock.mockRestore();
  //   });

  //   it('should throw NotFoundException if Notification Template is not found', async () => {
  //     jest.spyOn(notificationModel, 'findById').mockResolvedValueOnce(null);

  //     await expect(
  //       meetingNotificationService.update(
  //         mockMeeting._id,
  //         '64b8af91de9b68ab608c03b2',
  //         mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if invalid Meeting ID is given', async () => {
  //     const id = 'invalid-id';

  //     const isValidNotificationTempleteObjectIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingNotificationService.update(
  //         mockMeeting._id,
  //         id,
  //         mockMeetingNotificationDto as UpdateMeetingNotificationDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidNotificationTempleteObjectIdMock.mockRestore();
  //   });
  // });

  describe('RemoveMeetingNotificationFromMeeting', () => {
    it('should remove a Meeting Notification from a Meeting and return updated Meeting given ID', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);
      const updatedMeeting =
        await meetingNotificationService.removeNotificationFromMeeting(
          mockNotificationAddedMeeting._id,
          '64b8af91de9b68ab608c03b2',
        );

      expect(updatedMeeting).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if Notification is not found in Meeting', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        meetingNotificationService.removeNotificationFromMeeting(
          mockNotificationAddedMeeting._id,
          '64b8af91de9b68ab608c03b2',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting Notification ID is given', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidMeetingNotificationObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingNotificationService.removeNotificationFromMeeting(
          mockNotificationAddedMeeting._id,
          id,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingNotificationObjectId.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingNotificationService.removeNotificationFromMeeting(
          mockNotificationAddedMeeting._id,
          '64b8af91de9b68ab608c03b2',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting ID is given', async () => {
      const id = 'invalid-id';
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);
      const isValidMeetingObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingNotificationService.removeNotificationFromMeeting(
          id,
          '64b8af91de9b68ab608c03b2',
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectId.mockRestore();
    });
  });
});
