import { Test, TestingModule } from '@nestjs/testing';
import { ServiceService } from './service.service';
import { Service } from './schemas/service.schema';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create.service.dto';
import { UpdateServiceDto } from './dto/update.service.dto';

const mockService = {
  _id: '64a3f40a82ec8ffc929017a4',
  name: 'Single session',
  description: 'session description xxxx',
};

const mockCreatedService = {
  _id: '64a3f40a82ec8ffc929017a4',
  name: 'Single session',
  description: 'session description xxxx',
};

const mockUpdatedService = {
  _id: '64a3f40a82ec8ffc929017a4',
  name: 'Single session updated',
  description: 'session description xxxx updated',
};

describe('ServiceService', () => {
  let serviceService: ServiceService;
  let serviceModel: Model<Service>;

  const mockServicesArray = [
    {
      _id: '64d3623b79d8ded65bd108ef',
      name: 'Single session',
      description: 'session description 1234',
    },
    {
      _id: '64d3623b79d8ded65bd108ef',
      name: 'Couple session',
      description: 'session description xxxxx',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        {
          provide: getModelToken(Service.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    serviceService = module.get<ServiceService>(ServiceService);
    serviceModel = module.get<Model<Service>>(getModelToken(Service.name));
  });

  it('should be defined', () => {
    expect(serviceService).toBeDefined();
  });

  describe('findAllServices', () => {
    it('should return an array of Services', async () => {
      jest.spyOn(serviceModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockServicesArray),
      } as any);
      const services = await serviceService.findAll();

      expect(services).toEqual(mockServicesArray);
    });
  });

  describe('findOneService', () => {
    it('should return a Service given id', async () => {
      jest.spyOn(serviceModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockService),
      } as any);
      const service = await serviceService.findSelectedService(mockService._id);

      expect(service).toEqual(mockService);
    });

    it('should throw NotFoundException if Service is not found', async () => {
      jest.spyOn(serviceModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        serviceService.findSelectedService(mockService._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(serviceService.findSelectedService(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('createService', () => {
    it('should create and return new created Service', async () => {
      const newServiceDto: CreateServiceDto = {
        name: 'Single session',
        description: 'session description xxxx',
      };

      jest.spyOn(serviceModel, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: '64a3f40a82ec8ffc929017a4',
          ...newServiceDto,
        } as any),
      );
      const newService = await serviceService.cerateService(
        newServiceDto as CreateServiceDto,
      );

      expect(newService).toEqual(mockCreatedService);
    });
  });

  describe('updateService', () => {
    const updateService: UpdateServiceDto = {
      name: 'Single session updated',
      description: 'session description xxxx updated',
    };

    it('should update and return updated Service given ID', async () => {
      jest.spyOn(serviceModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          _id: '64a3f40a82ec8ffc929017a4',
          ...updateService,
        }),
      } as any);
      const updatedService = await serviceService.updateService(
        mockService._id,
        updateService as UpdateServiceDto,
      );

      expect(updatedService).toEqual(mockUpdatedService);
    });

    it('should throw NotFoundException if Service is not found', async () => {
      jest.spyOn(serviceModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        serviceService.updateService(
          mockService._id,
          updateService as UpdateServiceDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';
      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        serviceService.updateService(id, UpdateServiceDto),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('removeService', () => {
    it('should remove and return removed Service given ID', async () => {
      jest.spyOn(serviceModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockService),
        }),
      } as any);
      const deletedService = await serviceService.deleteSelectedService(
        mockService._id,
      );

      expect(deletedService).toEqual(mockService);
    });
  });
});
