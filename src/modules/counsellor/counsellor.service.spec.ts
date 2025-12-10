import mongoose, { Model } from 'mongoose';
import { CounsellorService } from './counsellor.service';
import { Counsellor, Gender, Status, Title } from './schemas/counsellor.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Service } from '../service/schema/service.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  ChangeStatusDto,
  CreateCounselorDto,
} from './dto/create.counsellor.dto';
import { UpdateCounselorDto } from './dto/update.counsellor.dto';

const mockCounselor = {
  _id: '64dc5abef44af0d0242a58ca',
  title: 'Ms',
  gender: 'Male',
  firstName: 'Marie',
  lastName: 'Jane',
  displayName: 'Marie Jane',
  email: 'seshankavisanka@gmail.com',
  hotline: '+94114567890',
  mobile: '+94702200312',
  dateOfBirth: '1990-01-01',
  practiceStartedOn: '1990-01-01',
  languagesSpoken: ['Sinhala'],
  sessionType: ['ON-PREMISE'],
  services: [],
  specialization: [],
  credentials: [],
  status: 'DRAFT',
  licenses: [],
};

const mockCreateCounselor = {
  _id: '64dc5abef44af0d0242a58ca',
  title: 'Ms',
  gender: 'Male',
  firstName: 'Marie',
  lastName: 'Jane',
  displayName: 'Marie Jane',
  email: 'seshankavisanka@gmail.com',
  hotline: '+94114567890',
  mobile: '+94702200312',
  dateOfBirth: '1990-01-01',
  practiceStartedOn: '1990-01-01',
  languagesSpoken: ['Sinhala'],
  sessionType: ['ON-PREMISE'],
  services: [],
  specialization: [],
  credentials: [],
  status: 'DRAFT',
  licenses: [],
};

const mockUpdateCounselor = {
  _id: '64dc5abef44af0d0242a58ca',
  title: 'Ms',
  gender: 'Male',
  firstName: 'Marie',
  lastName: 'Jane',
  displayName: 'Marie Jane',
  email: 'mariejane@gmail.com',
  hotline: '+94112200312',
  mobile: '+94703121211',
  dateOfBirth: '1990-01-01',
  practiceStartedOn: '1990-01-01',
  languagesSpoken: ['English', 'Sinhala'],
  sessionType: ['ONLINE', 'ON-PREMISE'],
  services: [],
  specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
  credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
  status: 'DRAFT',
  licenses: [
    {
      licenseType: 'Sri Lanka Counselling Association',
      licenseNumber: 'L12345',
      licenseExpirationDate: '2024-12-31',
    },
    {
      licenseType: 'REBT Counsellors Group',
      licenseNumber: 'AAABBCC',
      licenseExpirationDate: '2024-12-31',
    },
  ],
};

const mockServiceAddedCounselor = {
  _id: '64dc5abef44af0d0242a58ca',
  title: 'Ms',
  gender: 'Male',
  firstName: 'Marie',
  lastName: 'Jane',
  displayName: 'Marie Jane',
  email: 'mariejane@gmail.com',
  hotline: '+94112200312',
  mobile: '+94703121211',
  dateOfBirth: '1990-01-01',
  practiceStartedOn: '1990-01-01',
  languagesSpoken: ['English', 'Sinhala'],
  sessionType: ['ONLINE', 'ON-PREMISE'],
  services: [
    {
      _id: '64f802c6d6d00a26c26b3daa',
      name: 'Couple session',
      description: 'session description xxxxx',
    },
  ],
  specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
  credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
  status: 'DRAFT',
  licenses: [
    {
      licenseType: 'Sri Lanka Counselling Association',
      licenseNumber: 'L12345',
      licenseExpirationDate: '2024-12-31',
      _id: '64dc5c3915a6ea77cbee564d',
    },
    {
      licenseType: 'REBT Counsellors Group',
      licenseNumber: 'AAABBCC',
      licenseExpirationDate: '2024-12-31',
      _id: '64dc5c3915a6ea77cbee564e',
    },
  ],
};

const mockStatusChangedCounselor = {
  _id: '64dc5abef44af0d0242a58ca',
  title: 'Ms',
  gender: 'Male',
  firstName: 'Marie',
  lastName: 'Jane',
  displayName: 'Marie Jane',
  email: 'mariejane@gmail.com',
  hotline: '+94112200312',
  mobile: '+94703121211',
  dateOfBirth: '1990-01-01',
  practiceStartedOn: '1990-01-01',
  languagesSpoken: ['English', 'Sinhala'],
  sessionType: ['ONLINE', 'ON-PREMISE'],
  services: [
    {
      _id: '64d3623b79d8ded65bd108ef',
      name: 'Couple session',
      description: 'session description xxxxx',
    },
  ],
  specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
  credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
  status: 'APPROVED',
  licenses: [
    {
      licenseType: 'Sri Lanka Counselling Association',
      licenseNumber: 'L12345',
      licenseExpirationDate: '2024-12-31',
      _id: '64dc5c3915a6ea77cbee564d',
    },
    {
      licenseType: 'REBT Counsellors Group',
      licenseNumber: 'AAABBCC',
      licenseExpirationDate: '2024-12-31',
      _id: '64dc5c3915a6ea77cbee564e',
    },
  ],
};

describe('CounselorService', () => {
  let counsellorService: CounsellorService;
  let counsellorModel: Model<Counsellor>;
  let serviceModel: Model<Service>;

  const mockCounselorArray = [
    {
      _id: '64db4fed192a47efa0ea9838',
      title: 'Ms',
      gender: 'Male',
      firstName: 'Marie',
      lastName: 'Jane',
      displayName: 'Marie Jane',
      email: 'mariejane@gmail.com',
      hotline: '+94112200312',
      mobile: '+94703112121',
      dateOfBirth: '1990-01-01',
      practiceStartedOn: '1990-01-01',
      languagesSpoken: ['English', 'Sinhala'],
      sessionType: ['ONLINE', 'ON-PREMISE'],
      services: [
        {
          _id: '64d3623b79d8ded65bd108ef',
          name: 'Couple session',
          description: 'session description xxxxx',
          __v: 0,
        },
      ],
      specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
      credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
      status: 'REJECTED',
      licenses: [
        {
          licenseType: 'Sri Lanka Counselling Association',
          licenseNumber: 'L12345',
          licenseExpirationDate: '2024-12-31',
          _id: '64db51d6192a47efa0ea983d',
        },
        {
          licenseType: 'REBT Counsellors Group',
          licenseNumber: 'AAABBCC',
          licenseExpirationDate: '2024-12-31',
          _id: '64db51d6192a47efa0ea983e',
        },
      ],
    },
    {
      _id: '64db4fed192a47efa0ea9838',
      title: 'Ms',
      gender: 'Male',
      firstName: 'Marie',
      lastName: 'Jane',
      displayName: 'Marie Jane',
      email: 'mariejane@gmail.com',
      hotline: '+94112200312',
      mobile: '+94703112121',
      dateOfBirth: '1990-01-01',
      practiceStartedOn: '1990-01-01',
      languagesSpoken: ['English', 'Sinhala'],
      sessionType: ['ONLINE', 'ON-PREMISE'],
      services: [
        {
          _id: '64d3623b79d8ded65bd108ef',
          name: 'Couple session',
          description: 'session description xxxxx',
          __v: 0,
        },
      ],
      specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
      credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
      status: 'REJECTED',
      licenses: [
        {
          licenseType: 'Sri Lanka Counselling Association',
          licenseNumber: 'L12345',
          licenseExpirationDate: '2024-12-31',
          _id: '64db51d6192a47efa0ea983d',
        },
        {
          licenseType: 'REBT Counsellors Group',
          licenseNumber: 'AAABBCC',
          licenseExpirationDate: '2024-12-31',
          _id: '64db51d6192a47efa0ea983e',
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CounsellorService,
        {
          provide: getModelToken(Counsellor.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Service.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    counsellorService = module.get<CounsellorService>(CounsellorService);
    counsellorModel = module.get<Model<Counsellor>>(
      getModelToken(Counsellor.name),
    );
    serviceModel = module.get<Model<Service>>(getModelToken(Service.name));
  });

  it('should be defined', () => {
    expect(counsellorService).toBeDefined();
  });

  describe('findAllCounselors', () => {
    it('should return an array of Counselor', async () => {
      jest.spyOn(counsellorModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCounselorArray),
      } as any);
      const counsellors = await counsellorService.findAll();

      expect(counsellors).toEqual(mockCounselorArray);
    });
  });

  describe('findOneService', () => {
    it('should return a counsellor given by id', async () => {
      jest.spyOn(counsellorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCounselor),
      } as any);
      const counsellor = await counsellorService.findOne(mockCounselor._id);

      expect(counsellor).toEqual(mockCounselor);
    });

    it('should throw NotFoundException if counsellor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        counsellorService.findOne(mockCounselor._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(counsellorService.findOne(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('createCounselor', () => {
    it('should create and return a Counselor', async () => {
      const newCounselorDto: CreateCounselorDto = {
        title: Title.Ms,
        gender: Gender.Male,
        firstName: 'Marie',
        lastName: 'Jane',
        email: 'seshankavisanka@gmail.com',
        hotline: '+94114567890',
        mobile: '+94702200312',
        dateOfBirth: '1990-01-01',
        practiceStartedOn: '1990-01-01',
        languagesSpoken: ['Sinhala'],
        sessionType: ['ON-PREMISE'],
      };

      jest
        .spyOn(counsellorModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockCreateCounselor as any),
        );
      const newCounselor = await counsellorService.createCounsellor(
        newCounselorDto as CreateCounselorDto,
      );

      expect(newCounselor).toEqual(mockCreateCounselor);
    });
  });

  describe('updateCounselor', () => {
    const updateCounselorDto: UpdateCounselorDto = {
      specialization: ['Marriage and Family Counseling', 'REBT Therapy'],
      credentials: ['BSc. Counselling Psychology', 'REBT Qualified Counsellor'],
      licenses: [
        {
          licenseType: 'Sri Lanka Counselling Association',
          licenseNumber: 'L12345',
          licenseExpirationDate: '2024-12-31',
        },
        {
          licenseType: 'REBT Counsellors Group',
          licenseNumber: 'AAABBCC',
          licenseExpirationDate: '2024-12-31',
        },
      ],
    };

    it('should update and return updated Counselor given ID', async () => {
      jest.spyOn(counsellorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdateCounselor),
      } as any);
      const updatedCounselor = await counsellorService.updateCounsellor(
        mockUpdateCounselor._id,
        updateCounselorDto as UpdateCounselorDto,
      );

      expect(updatedCounselor).toEqual(mockUpdateCounselor);
    });

    it('should throw NotFoundException if counsellor is not found', async () => {
      jest.spyOn(counsellorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        counsellorService.updateCounsellor(
          mockUpdateCounselor._id,
          updateCounselorDto as UpdateCounselorDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        counsellorService.updateCounsellor(
          id,
          updateCounselorDto as UpdateCounselorDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('removeCounselor', () => {
    it('should remove and return counsellor given ID', async () => {
      jest.spyOn(counsellorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockCounselor),
        }),
      } as any);
      const deletedCounselor = await counsellorService.deleteCounsellor(
        mockCounselor._id,
      );

      expect(deletedCounselor).toEqual(mockCounselor);
    });
  });

  describe('addServiceToCounselor', () => {
    const mockService = {
      _id: '64d3623b79d8ded65bd108ef',
      name: 'Couple session',
      description: 'session description xxxxx',
      _v: 0,
    };

    it('should add Service to service array and return updated Counselor', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValue(mockService);

      jest.spyOn(counsellorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockServiceAddedCounselor),
      } as any);
      const updatedCounselor = await counsellorService.addServiceToCounselor(
        mockServiceAddedCounselor._id,
        mockService._id,
      );

      expect(updatedCounselor).toEqual(mockServiceAddedCounselor);
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValue(mockService);

      jest.spyOn(counsellorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        counsellorService.addServiceToCounselor(
          mockServiceAddedCounselor._id,
          mockService._id,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invaild Counselor ID is given', async () => {
      const counsellorId = ' invalid-id';
      const isValidServiceObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      jest.spyOn(serviceModel, 'findById').mockResolvedValue(mockService);
      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        counsellorService.addServiceToCounselor(counsellorId, mockService._id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidServiceObjectIdMock.mockRestore();
    });

    it('should find a Service by given ID', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValueOnce(mockService);
      const service = await serviceModel.findById(mockService._id);

      expect(service).toEqual(mockService);
    });

    it('should throw NotFoundException if Servic is not found', async () => {
      jest.spyOn(serviceModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        counsellorService.addServiceToCounselor(
          mockServiceAddedCounselor._id,
          mockService._id,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid service ID is given', async () => {
      const invalidServiceId = 'invalid-id';
      const isValidServiceObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        counsellorService.addServiceToCounselor(
          mockServiceAddedCounselor._id,
          invalidServiceId,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidServiceObjectIdMock.mockRestore();
    });
  });

  describe('removeServiceFromCounselor', () => {
    it('should remove a Service from the Counselor and return updated Counselor', async () => {
      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValue(mockServiceAddedCounselor);

      jest.spyOn(counsellorModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCounselor),
      } as any);
      const updatedCounselor =
        await counsellorService.removeServiceFromCounselor(
          mockServiceAddedCounselor._id,
          '64f802c6d6d00a26c26b3daa',
        );

      expect(updatedCounselor).toEqual(mockCounselor);
    });

    it('should throw NotFoundException if Service is not found', async () => {
      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValue(mockServiceAddedCounselor);

      jest.spyOn(counsellorModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        counsellorService.removeServiceFromCounselor(
          mockServiceAddedCounselor._id,
          '64f802c6d6d00a26c26b3daa',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Service ID is given', async () => {
      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);
      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValue(mockServiceAddedCounselor);

      const serviceId = ' invalid-id';
      const isValidServiceObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);
      await expect(
        counsellorService.removeServiceFromCounselor(
          mockServiceAddedCounselor._id,
          serviceId,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidServiceObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValue(null);

      await expect(
        counsellorService.removeServiceFromCounselor(
          mockServiceAddedCounselor._id,
          '64f802c6d6d00a26c26b3daa',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Counselor ID is given', async () => {
      const counsellorId = ' invalid-id';
      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);
      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValue(mockServiceAddedCounselor);

      await expect(
        counsellorService.removeServiceFromCounselor(
          counsellorId,
          '64f802c6d6d00a26c26b3daa',
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
    });
  });

  describe('changeStatus', () => {
    it('should change Status value based on enum {DRAFT, APPROVED, REJECTED}', async () => {
      const status: ChangeStatusDto = {
        status: Status.APPROVED,
      };

      jest.spyOn(counsellorModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCounselor),
      } as any);

      jest.spyOn(counsellorModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockStatusChangedCounselor),
      } as any);
      const statusChangedCounselor = await counsellorService.statusChange(
        mockStatusChangedCounselor._id,
        status,
      );

      expect(statusChangedCounselor).toEqual(mockStatusChangedCounselor);
    });
  });
});
