import mongoose, { Model } from 'mongoose';
import { ClientService } from './client.service';
import { Client } from './schemas/client.schema';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { DataForm } from '../data-form/schemas/data-form.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClientDto, CreateIntakeForm } from './dto/create.client.dto';
import { UpdateClientDto } from './dto/update.client.dto';

const mockClient = {
  _id: '64e5b1fc78f16e269e5a021d',
  name: 'Client 1',
  phone: '+92222222726',
  phoneVerified: false,
  counsellor: '64db4fed192a47efa0ea9838',
  email: 'user@umbartha.org',
  emailVerified: false,
  intakeForm: [],
};

const mockCreatedClient = {
  _id: '64e5b1fc78f16e269e5a021d',
  name: 'Client 1',
  phone: '+92222222726',
  phoneVerified: false,
  counsellor: '64db4fed192a47efa0ea9838',
  email: 'user@umbartha.org',
  emailVerified: false,
  intakeForm: [],
};

const mockUpdatedClient = {
  _id: '64e5b1fc78f16e269e5a021d',
  name: 'Client 1',
  phone: '+9222334222726',
  phoneVerified: false,
  counsellor: '64db4fed192a47efa0ea9838',
  email: 'update@umbartha.org',
  emailVerified: false,
  intakeForm: [],
};

const mockAddedIntakeForm = {
  _id: '64e5b41378f16e269e5a0222',
  name: 'Client 1',
  phone: '+92222222726',
  phoneVerified: false,
  counsellor: '64db4fed192a47efa0ea9838',
  email: 'user@umbartha.org',
  emailVerified: false,
  intakeForm: [
    {
      date: '2023-07-27',
      form: '64c2085d32b5cbe8a2adff40',
      formData: {
        date: 'date',
        form: 'formId',
      },
      _id: '64e5b42078f16e269e5a0225',
    },
  ],
};

describe('ClientService', () => {
  let clientService: ClientService;
  let clientModel: Model<Client>;
  let counsellorModel: Model<Counsellor>;
  let dataFormModel: Model<DataForm>;

  const mockClientsArray = [
    {
      _id: '64e5b1fc78f16e269e5a021d',
      name: 'Client 1',
      phone: '+92222222726',
      phoneVerified: false,
      counsellor: '64db4fed192a47efa0ea9838',
      email: 'user@umbartha.org',
      emailVerified: false,
      intakeForm: [],
    },
    {
      _id: '64e5b41378f16e269e5a0222',
      name: 'Client 1',
      phone: '+92222222726',
      phoneVerified: false,
      counsellor: '64db4fed192a47efa0ea9838',
      email: 'user@umbartha.org',
      emailVerified: false,
      intakeForm: [
        {
          date: '2023-07-27',
          form: '64c2085d32b5cbe8a2adff40',
          formData: {
            date: 'date',
            form: 'formId',
          },
          _id: '64e5b42078f16e269e5a0225',
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getModelToken(Client.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: getModelToken(Counsellor.name),
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: getModelToken(DataForm.name),
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    clientService = module.get<ClientService>(ClientService);
    clientModel = module.get<Model<Client>>(getModelToken(Client.name));
    counsellorModel = module.get<Model<Counsellor>>(
      getModelToken(Counsellor.name),
    );
    dataFormModel = module.get<Model<DataForm>>(getModelToken(DataForm.name));
  });

  it('shoudl be defined', () => {
    expect(clientService).toBeDefined();
  });

  describe('findAllClients', () => {
    it('should return an array of all clients', async () => {
      jest.spyOn(clientModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClientsArray),
      } as any);
      const clients = await clientService.findAll();

      expect(clients).toEqual(mockClientsArray);
    });
  });

  describe('findOneClient', () => {
    it('should return a Client given by ID', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);
      const createdClient = await clientService.findSelectedClient(
        mockClientsArray[0]._id,
      );

      expect(createdClient).toEqual(mockClient);
    });

    it('should return NotFoundException if Client is not found', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        clientService.findSelectedClient('64e5b1fc78f16e269e5a021d'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return BadRequestException if Client ID is not valid', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(clientService.findSelectedClient(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('createNewClient', () => {
    const mockCounselor = {
      _id: '64db4fed192a47efa0ea9838',
      title: 'Ms',
      gender: 'Male',
      firstName: 'Seshan',
      lastName: 'Kavisanka',
      displayName: 'Seshan Kavisanka',
      email: 'seshankavisanka@gmail.com',
      hotline: '+94114567890',
      mobile: '+94702200312',
      dateOfBirth: '1990-01-01',
      practiceStartedOn: '1990-01-01',
      languagesSpoken: ['Tamil'],
      sessionType: ['ON-PREMISE'],
      services: [],
      specialization: [],
      credentials: [],
      status: 'DRAFT',
      licenses: [],
    };

    const mockNewClientDto: CreateClientDto = {
      name: 'Client 1',
      phone: '+92222222726',
      counsellor: '64db4fed192a47efa0ea9838',
      email: 'user@umbartha.org',
    };

    it('should create a new client and return created client', async () => {
      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValueOnce(mockCounselor);

      jest
        .spyOn(clientModel, 'create')
        .mockResolvedValueOnce(mockCreatedClient as any);
      const createdClient = await clientService.createClient(mockNewClientDto);

      expect(createdClient).toEqual(mockCreatedClient);
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        clientService.createClient(mockNewClientDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Counselor ID is not valid', async () => {
      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        clientService.createClient(mockNewClientDto),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
    });
  });

  describe('updateClient', () => {
    const mockCounselor = {
      _id: '64db4fed192a47efa0ea9838',
      title: 'Ms',
      gender: 'Male',
      firstName: 'Seshan',
      lastName: 'Kavisanka',
      displayName: 'Seshan Kavisanka',
      email: 'seshankavisanka@gmail.com',
      hotline: '+94114567890',
      mobile: '+94702200312',
      dateOfBirth: '1990-01-01',
      practiceStartedOn: '1990-01-01',
      languagesSpoken: ['Tamil'],
      sessionType: ['ON-PREMISE'],
      services: [],
      specialization: [],
      credentials: [],
      status: 'DRAFT',
      licenses: [],
    };

    const mockUpdatedClientDto: UpdateClientDto = {
      phone: '+9222334222726',
      counsellor: '64db4fed192a47efa0ea9838',
      email: 'update@umbartha.org',
    };

    it('should update and return updated client', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      jest
        .spyOn(counsellorModel, 'findById')
        .mockResolvedValueOnce(mockCounselor);

      jest.spyOn(clientModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedClient),
      } as any);
      const createdClient = await clientService.updateSelectedClient(
        mockCreatedClient._id,
        mockUpdatedClientDto as UpdateClientDto,
      );

      expect(createdClient).toEqual(mockUpdatedClient);
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      jest.spyOn(counsellorModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        clientService.updateSelectedClient(
          mockCreatedClient._id,
          mockUpdatedClientDto as UpdateClientDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Counselor ID is not valid', async () => {
      const isValidClientrObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      const isValidCounselorObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        clientService.updateSelectedClient(
          mockCreatedClient._id,
          mockUpdatedClientDto as UpdateClientDto,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidClientrObjectIdMock.mockRestore();
    });
  });

  describe('removeClient', () => {
    it('should remove and return Client given by ID', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockCreatedClient),
        }),
      } as any);
      const deletedClient = await clientService.deleteSelectClient(
        mockCreatedClient._id,
      );

      expect(deletedClient).toEqual(mockCreatedClient);
    });
  });

  describe('addNewIntakeForm', () => {
    const mockDataForm = {
      type: 'BASIC',
      title: 'Client intake form',
      description: 'Description about the data collected',
      _id: '64e5d67bbe94beedde7171b3',
      data: [],
    };

    const mockIntakeFormDto: CreateIntakeForm = {
      date: '2023-07-27',
      form: '64c2085d32b5cbe8a2adff40',
      formData: {
        date: 'date',
        form: 'formId',
      },
    };

    it('should add new Intake Form to Client and return updated Client', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      jest.spyOn(dataFormModel, 'findById').mockResolvedValueOnce(mockDataForm);

      jest.spyOn(clientModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockAddedIntakeForm),
      } as any);
      const updatedClient = await clientService.addIntakeFormToClient(
        mockCreatedClient._id,
        mockIntakeFormDto as CreateIntakeForm,
      );

      expect(updatedClient).toEqual(mockAddedIntakeForm);
    });

    it('should throw NotFoundException if Data Form is not found', async () => {
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      jest.spyOn(dataFormModel, 'findById').mockResolvedValueOnce(null);

      await expect(
        clientService.addIntakeFormToClient(
          mockCreatedClient._id,
          mockIntakeFormDto as CreateIntakeForm,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Data Form ID is not valid', async () => {
      const isValidClientObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);
      jest.spyOn(clientModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockClient),
      } as any);

      const isValidDataFormObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        clientService.addIntakeFormToClient(
          mockCreatedClient._id,
          mockIntakeFormDto as CreateIntakeForm,
        ),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidDataFormObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidClientObjectIdMock.mockRestore();
    });
  });

  describe('removeIntakeForm', () => {
    it('should remove a Intake Form from Client and return updated Client', async () => {
      clientService.findSelectedClient = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockAddedIntakeForm),
      });

      jest.spyOn(clientModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCreatedClient),
      } as any);
      const updatedClient = await clientService.removeIntakeFormFromClient(
        mockAddedIntakeForm._id,
        '64e5b42078f16e269e5a0225',
      );

      expect(updatedClient).toEqual(mockCreatedClient);
    });

    it('should throw NotFoundException if Client is not found', async () => {
      clientService.findSelectedClient = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockAddedIntakeForm),
      });

      jest.spyOn(clientModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        clientService.removeIntakeFormFromClient(
          mockAddedIntakeForm._id,
          '64e5b42078f16e269e5a0225',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if Client is not found', async () => {
      clientService.findSelectedClient = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockAddedIntakeForm),
      });

      const id = 'invali-id';
      const isValidIntakeFormObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        clientService.removeIntakeFormFromClient(mockAddedIntakeForm._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidIntakeFormObjectIdMock.mockRestore();
    });
  });
});
