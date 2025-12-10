import mongoose, { Model } from 'mongoose';
import { MeetingScheduleService } from './meeting-schedule.service';
import { Meeting, Range, Types } from './schemas/meeting.schema';
import { Location } from '../location/schemas/location.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CreateScheduleDto } from './dto/create.meeting.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockMeeting = {
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
        startTime: '0800',
        endTime: '1000',
        room: ['64e4e17bc42d225f28939a7e'],
        _id: '64e4e18bc42d225f28939a84',
      },
    ],
  },
};

const mockCreateMeeting = {
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
    schedule: [],
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
};

describe('MeetingScheduleService', () => {
  let meetingScheduleService: MeetingScheduleService;
  let meetingModel: Model<Meeting>;
  let locationModel: Model<Location>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingScheduleService,
        {
          provide: getModelToken(Meeting.name),
          useValue: {
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Location.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    meetingScheduleService = module.get<MeetingScheduleService>(
      MeetingScheduleService,
    );
    meetingModel = module.get<Model<Meeting>>(getModelToken(Meeting.name));
    locationModel = module.get<Model<Location>>(getModelToken(Location.name));
  });

  it('should be defined', () => {
    expect(meetingScheduleService).toBeDefined();
  });

  describe('AddNewScheduleToMeeting', () => {
    const mockCreateScheduleDto = {
      type: Types.EVERYDAY,
      startTime: '1500',
      endTime: '1600',
      room: ['64e4e17bc42d225f28939a7e'],
    };

    it('should add new Schedule to Meeting and return updated Meeting', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      const mockLocation = {
        name: 'Meeting Room',
        meetingRoom: true,
        _id: '64e4e17bc42d225f28939a7e',
        gallery: [],
        closedDatePlan: [],
      };
      jest.spyOn(locationModel, 'findById').mockResolvedValueOnce(mockLocation);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedMeeting),
      } as any);
      const updatedMeeting = await meetingScheduleService.addScheduleForMeeting(
        mockCreateMeeting._id,
        mockCreateScheduleDto as unknown as CreateScheduleDto,
      );

      expect(updatedMeeting).toEqual(mockUpdatedMeeting);
    });

    it('should throw a BadRequestException if new Create Schedule is not a meeting room', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      const mockLocation = {
        name: 'Meeting Room',
        meetingRoom: false,
        _id: '64e4e17bc42d225f28939a7e',
        gallery: [],
        closedDatePlan: [],
      };
      jest.spyOn(locationModel, 'findById').mockResolvedValueOnce(mockLocation);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a NotFoundException if new Create Schedule is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      jest.spyOn(locationModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException if invalid Room ID is given', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);
      const isValidMeetingObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const isValidLocationObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidLocationObjectIdMock.mockRestore();
    });

    it('should throw a BadRequestException if new Create Schedule time frame conflicts with exiting schedule', async () => {
      const mockCreateScheduleDto = {
        type: Types.EVERYDAY,
        startTime: '0830',
        endTime: '0930',
        room: ['64e4e17bc42d225f28939a7e'],
      };

      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException if new Create Schedule end time is after start time', async () => {
      const mockCreateScheduleDto = {
        type: Types.EVERYDAY,
        startTime: '1000',
        endTime: '0800',
        room: ['64e4e17bc42d225f28939a7e'],
      };

      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException if new Create Schedule is Range and start date and end date is same', async () => {
      const mockCreateScheduleDto: CreateScheduleDto = {
        type: Types.RANGE,
        rangeFrom: Range.MON,
        rangeTo: Range.MON,
        startTime: '0800',
        endTime: '1000',
        room: ['64e4e17bc42d225f28939a7e'],
      };

      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(mockMeeting);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw a NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          mockCreateMeeting._id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a NotFoundException if invalid Meeting ID is given', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingScheduleService.addScheduleForMeeting(
          id,
          mockCreateScheduleDto as unknown as CreateScheduleDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('removeAScheduleFromMeeting', () => {
    it('should remove a Schedule from Meeting and return updated Meeting based on provided ID', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCreateMeeting),
      } as any);
      const updatedMeeting = await meetingScheduleService.remove(
        mockUpdatedMeeting._id,
        '64e4e18bc42d225f28939a84',
      );

      expect(updatedMeeting).toEqual(mockCreateMeeting);
    });

    it('should throw NotFoundException if Schedule is not found in Meeting', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);

      jest.spyOn(meetingModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        meetingScheduleService.remove(
          mockUpdatedMeeting._id,
          '64e4e18bc42d225f28939a84',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Schedule ID is not valid ObejctId', async () => {
      jest
        .spyOn(meetingModel, 'findById')
        .mockResolvedValueOnce(mockUpdatedMeeting);
      const isValidMeetingObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      const id = 'invalid-id';
      const isValidScheduleObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        meetingScheduleService.remove(mockUpdatedMeeting._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidScheduleObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingScheduleService.remove(
          mockUpdatedMeeting._id,
          '64e4e18bc42d225f28939a84',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Meeting ID is not valid ObejctId', async () => {
      const id = 'invalid-id';

      const isValidMeetingObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(false);

      await expect(
        meetingScheduleService.remove(id, '64e4e18bc42d225f28939a84'),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidMeetingObjectIdMock.mockRestore();
    });
  });
});
