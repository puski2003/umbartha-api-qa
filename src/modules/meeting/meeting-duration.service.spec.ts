import mongoose, { Model } from 'mongoose';
import { MeetingDurationService } from './meeting-duration.service';
import { Meeting } from './schemas/meeting.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CreatedurationOptionDto } from './dto/create.meeting.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateDurationOptionDto } from './dto/update.meeting.dto';

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
//     durationOptions: [
//       {
//         hours: 1,
//         mins: 15,
//         display: '1 Hr 15Mins',
//         _id: '64e493d5bf1050a5e3327c44',
//       },
//     ],
//     schedule: [],
//   },
// };

const mockDurationAddedMeeting = {
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
    durationOptions: [],
    schedule: [],
  },
};

// const mockUpdatedDurationOptionMeeting = {
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
//         hours: 0,
//         mins: 30,
//         display: '1 Hr 15Mins',
//         _id: '64e493d5bf1050a5e3327c44',
//       },
//     ],
//     schedule: [],
//   },
// };

describe('MeetingDurationService', () => {
  let meetingDurationService: MeetingDurationService;
  let meetingModel: Model<Meeting>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingDurationService,
        {
          provide: getModelToken(Meeting.name),
          useValue: {
            findByIdAndUpdate: jest.fn(),
            findById: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    meetingDurationService = module.get<MeetingDurationService>(
      MeetingDurationService,
    );
    meetingModel = module.get<Model<Meeting>>(getModelToken(Meeting.name));
  });

  it('should be defined', () => {
    expect(meetingDurationService).toBeDefined();
  });

  describe('addNewDurationOption', () => {
    const mockMeetingDurationDto: CreatedurationOptionDto = {
      hours: 1,
      mins: 15,
    };

    it('should add a new Duration Option to a Meeting and return the meeting', async () => {
      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDurationAddedMeeting),
      } as any);
      const updatedMeeting = await meetingDurationService.addDurationForMeeting(
        mockMeeting._id,
        mockMeetingDurationDto as CreatedurationOptionDto,
      );

      expect(updatedMeeting).toEqual(mockDurationAddedMeeting);
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        meetingDurationService.addDurationForMeeting(
          mockMeeting._id,
          mockMeetingDurationDto as CreatedurationOptionDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting ID is given', async () => {
      const id = 'ivalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingDurationService.addDurationForMeeting(
          id,
          mockMeetingDurationDto as CreatedurationOptionDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  // describe('updateDurationOption', () => {
  //   const mockUpdateDurationOptionDto: UpdateDurationOptionDto = {
  //     hours: 0,
  //     mins: 30,
  //   };
  //   it('should update a Meeting Duration Option in Meeting and return updated Meeting', async () => {
  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(mockUpdatedDurationOptionMeeting),
  //     } as any);
  //     const updatedDuration = await meetingDurationService.update(
  //       mockUpdatedMeeting._id,
  //       '64e493d5bf1050a5e3327c44',
  //       mockUpdateDurationOptionDto as UpdateDurationOptionDto,
  //     );

  //     expect(updatedDuration).toEqual(mockUpdatedDurationOptionMeeting);
  //   });

  //   it('should throw NotFoundException if Meeting Duration Option is not found', async () => {
  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);

  //     jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(null),
  //     } as any);

  //     await expect(
  //       meetingDurationService.update(
  //         mockUpdatedMeeting._id,
  //         '64e493d5bf1050a5e3327c44',
  //         mockUpdateDurationOptionDto as UpdateDurationOptionDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if invalid Meeting Duration Option ID is given', async () => {
  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);
  //     const isValidMeetingIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValueOnce(true);

  //     const id = 'invalid-id';
  //     const isValidDurationOptionIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingDurationService.update(
  //         mockUpdatedMeeting._id,
  //         id,
  //         mockUpdateDurationOptionDto as UpdateDurationOptionDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidMeetingIdMock.mockRestore();
  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidDurationOptionIdMock.mockRestore();
  //   });

  //   it('should throw NotFoundException if Meeting is not found', async () => {
  //     jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

  //     await expect(
  //       meetingDurationService.update(
  //         mockUpdatedMeeting._id,
  //         '64e493d5bf1050a5e3327c44',
  //         mockUpdateDurationOptionDto as UpdateDurationOptionDto,
  //       ),
  //     ).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if invalid Meeting ID is given', async () => {
  //     const id = 'invalid-id';
  //     const isValidMeetingIdMock = jest
  //       .spyOn(mongoose, 'isValidObjectId')
  //       .mockReturnValue(false);

  //     await expect(
  //       meetingDurationService.update(
  //         id,
  //         '64e493d5bf1050a5e3327c44',
  //         mockUpdateDurationOptionDto as UpdateDurationOptionDto,
  //       ),
  //     ).rejects.toThrow(BadRequestException);

  //     // restoring the original behavior of isValidObjectId after the test
  //     isValidMeetingIdMock.mockRestore();
  //   });
  // });

  describe('deleteDurationOption', () => {
    it('should delete a Meeting Duration Option from Meeting and return updated Meeting', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(true);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);
      const updatedDuration = await meetingDurationService.remove(
        mockDurationAddedMeeting._id,
        '64e493d5bf1050a5e3327c44',
      );

      expect(updatedDuration).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if Meeting Duration Option is not found', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockDurationAddedMeeting);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        meetingDurationService.remove(
          mockDurationAddedMeeting._id,
          '64e493d5bf1050a5e3327c44',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting Duration Option ID is given', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockDurationAddedMeeting);
      const isValidMeetingIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidDurationOptionIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingDurationService.remove(mockDurationAddedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidDurationOptionIdMock.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingDurationService.remove(
          mockDurationAddedMeeting._id,
          '64e493d5bf1050a5e3327c44',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Meeting ID is given', async () => {
      const id = 'invalid-id';
      const isValidMeetingIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingDurationService.remove(id, '64e493d5bf1050a5e3327c44'),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingIdMock.mockRestore();
    });
  });
});
