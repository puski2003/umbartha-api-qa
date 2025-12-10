import mongoose, { Model } from 'mongoose';
import { MeetingService } from './meeting.service';
import { Meeting, MeetingType } from './schemas/meeting.schema';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create.meeting.dto';
import { UpdateMeetingDto } from './dto/update.meeting.dto';

const mockMeeting = {
  _id: '64ba46b68f34a17d2facbb5b',
  meetingType: 'ONLINE',
  organizer: '64b66e585a486a82d2a9e5b8',
  internalName: 'My Counselling Sessions for the Week',
  description: 'some text',
  scheduling: {
    title: 'Calendar page title',
    description: 'Description to display on Calendar page',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64ba46b68f34a17d2facbb5c',
    notifications: [
      {
        type: 'EMAIL',
        enable: true,
        template: '64b8af91de9b68ab608c03b2',
        remark: 'Booking confirmation email',
        sendBefore: -1,
        _id: '64ba46c38f34a17d2facbb60',
      },
    ],
    durationOptions: [
      {
        hours: 1,
        mins: 15,
        display: '1 Hr 15Mins',
        _id: '64ba46c78f34a17d2facbb64',
      },
    ],
    schedule: [],
  },
  payment: {
    available: [],
    _id: '64ba73511cda75e5e1513a14',
    overrides: [],
  },
};

const mockCreatedMeeting = {
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

const mockUpdatedMeeting = {
  _id: '64e49224bf1050a5e3327c35',
  meetingType: 'ONLINE',
  organizer: '64db4fed192a47efa0ea9838',
  internalName: 'My Counselling Sessions for the Week updated',
  description: 'some text updated',
  scheduling: {
    title: 'Calendar page title updated',
    description: 'Description to display on Calendar page updated',
    enablePayments: true,
    timezone: 'GMT+5.30',
    _id: '64e49224bf1050a5e3327c36',
    notifications: [],
    durationOptions: [],
    schedule: [],
  },
};

describe('MeetingService', () => {
  let meetingService: MeetingService;
  let meetingModel: Model<Meeting>;
  let counsellorModel: Model<Counsellor>;

  const mockMeetingsArray = [
    {
      _id: '64ba46b68f34a17d2facbb5b',
      meetingType: 'ONLINE',
      organizer: '64b66e585a486a82d2a9e5b8',
      internalName: 'My Counselling Sessions for the Week',
      description: 'some text',
      scheduling: {
        title: 'Calendar page title',
        description: 'Description to display on Calendar page',
        enablePayments: true,
        timezone: 'GMT+5.30',
        _id: '64ba46b68f34a17d2facbb5c',
        notifications: [
          {
            type: 'EMAIL',
            enable: true,
            template: '64b8af91de9b68ab608c03b2',
            remark: 'Booking confirmation email',
            sendBefore: -1,
            _id: '64ba46c38f34a17d2facbb60',
          },
        ],
        durationOptions: [
          {
            hours: 1,
            mins: 15,
            display: '1 Hr 15Mins',
            _id: '64ba46c78f34a17d2facbb64',
          },
        ],
        schedule: [],
      },
      payment: {
        available: [],
        _id: '64ba73511cda75e5e1513a14',
        overrides: [],
      },
    },
    {
      _id: '64e34745d34a005acdbcb35d',
      meetingType: 'ONLINE',
      organizer: '64db4fed192a47efa0ea9838',
      internalName: 'My Counselling Sessions for the Week',
      description: 'some text',
      scheduling: {
        title: 'Calendar page title',
        description: 'Description to display on Calendar page',
        enablePayments: true,
        timezone: 'GMT+5.30',
        _id: '64e34745d34a005acdbcb35e',
        notifications: [],
        durationOptions: [],
        schedule: [],
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingService,
        {
          provide: getModelToken(Meeting.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Counsellor.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    meetingService = module.get<MeetingService>(MeetingService);
    meetingModel = module.get<Model<Meeting>>(getModelToken(Meeting.name));
    counsellorModel = module.get<Model<Counsellor>>(
      getModelToken(Counsellor.name),
    );
  });

  it('should be defined', () => {
    expect(meetingService).toBeDefined();
  });

  describe('findAllMeetings', () => {
    it('should return an array of all Meetings', async () => {
      jest.spyOn(meetingModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeetingsArray),
      } as any);
      const meetings = await meetingService.findAll();

      expect(meetings).toEqual(mockMeetingsArray);
    });
  });

  describe('findOneMeeting', () => {
    it('should return a Meeting by ID', async () => {
      jest.spyOn(meetingModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);
      const meeting = await meetingService.findSelectedMeeting(mockMeeting._id);

      expect(meeting).toEqual(mockMeeting);
    });

    it('should throw NotFoundException if Meeting is not found', async () => {
      jest.spyOn(meetingModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        meetingService.findSelectedMeeting(mockMeeting._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(false);

      await expect(meetingService.findSelectedMeeting(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('createMeeting', () => {
    const newMeetingDto: CreateMeetingDto = {
      meetingType: MeetingType.ONLINE,
      organizer: '64db4fed192a47efa0ea9838',
      internalName: 'My Counselling Sessions for the Week',
      description: 'some text',
      scheduling: {
        title: 'Calendar page title',
        description: 'Description to display on Calendar page',
        enablePayments: true,
        timezone: 'GMT+5.30',
      },
    };

    it('should create and return a new Meeting', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValueOnce(true);

      jest.spyOn(meetingModel, 'create').mockImplementationOnce(
        () =>
          Promise.resolve({
            ...mockCreatedMeeting,
          }) as any,
      );
      const newMeeting = await meetingService.createMeeting(
        newMeetingDto as CreateMeetingDto,
      );

      expect(newMeeting).toEqual(mockCreatedMeeting);
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingService.createMeeting(newMeetingDto as CreateMeetingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ID', async () => {
      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(false);

      await expect(
        meetingService.createMeeting(newMeetingDto as CreateMeetingDto),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
    });
  });

  describe('updateMeeting', () => {
    const updateMeetingDto: UpdateMeetingDto = {
      meetingType: MeetingType.ON_PREMISE,
      organizer: '64db4fed192a47efa0ea9838',
      internalName: 'My Counselling Sessions for the Week updated',
      description: 'some text updated',
      scheduling: {
        title: 'Calendar page title updated',
        description: 'Description to display on Calendar page updated',
        enablePayments: true,
        timezone: 'GMT+5.30',
      },
    };

    it('should update and return updated Meeting given ID', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValue(true);

      jest.spyOn(meetingModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockMeeting),
      } as any);

      jest.spyOn(meetingModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedMeeting),
      } as any);
      const updatedMeeting = await meetingService.updateMeeting(
        mockCreatedMeeting._id,
        updateMeetingDto as UpdateMeetingDto,
      );

      expect(updatedMeeting).toEqual(mockUpdatedMeeting);
    });

    it('should throw NotFoundException for Couneslor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        meetingService.updateMeeting(
          mockCreatedMeeting._id,
          updateMeetingDto as UpdateMeetingDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw Bad RequestException for invalid Counselor ID', async () => {
      const id = 'invalid-id';

      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(false);

      await expect(
        meetingService.updateMeeting(id, updateMeetingDto as UpdateMeetingDto),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
    });
  });

  describe('removeMeeting', () => {
    it('should remove and return Meeting given ID', async () => {
      jest.spyOn(meetingModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockMeeting),
        }),
      } as any);
      const deletedMeeting = await meetingService.deleteMeeting(
        mockMeeting._id,
      );

      expect(deletedMeeting).toEqual(mockMeeting);
    });
  });
});
