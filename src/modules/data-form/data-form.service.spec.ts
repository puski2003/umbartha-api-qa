import mongoose, { Model } from 'mongoose';
import { DataFormService } from './data-form.service';
import { DataForm } from './schemas/data-form.schema';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateData, CreateDataFormDto } from './dto/data-form.dto';
import { UpdateDataFormDto } from './dto/update.data-form.dto';

const mockDataForm = {
  type: 'BASIC',
  title: 'Client intake form',
  description: 'Description about the data collected',
  counsellor: '64e30f854d2daacb043e1a2c',
  _id: '64e831a0b196d459298df18d',
  data: [],
};

const mockCreatedDataForm = {
  type: 'BASIC',
  title: 'Client intake form',
  description: 'Description about the data collected',
  counsellor: '64e30f854d2daacb043e1a2c',
  _id: '64e831a0b196d459298df18d',
  data: [],
};

const mockCreatedDynamicDataForm = {
  type: 'DYNAMIC',
  title: 'Client intake form',
  description: 'Description about the data collected',
  counsellor: '64e30f854d2daacb043e1a2c',
  _id: '64e831a0b196d459298df18d',
  data: [],
};

const mockUpdatedDataForm = {
  _id: '64e831a0b196d459298df18d',
  type: 'BASIC',
  title: 'Client intake form updated',
  description: 'Description about the data collected updated',
  counsellor: '64db4fed192a47efa0ea9838',
  data: [],
};

const mockDataFormAddedData = {
  _id: '64e831a0b196d459298df18d',
  type: 'BASIC',
  title: 'Client intake form',
  description: 'Description about the data collected',
  counsellor: '64db4fed192a47efa0ea9838',
  data: [
    {
      name: 'gender',
      type: 'radio',
      displayName: 'First Name',
      required: true,
      options: [
        {
          value: 'male',
          display: 'Male',
          target: [],
          _id: '64e850ee7bf17123b1e5454d',
        },
        {
          value: 'female',
          display: 'Female',
          target: [],
          _id: '64e850ee7bf17123b1e5454e',
        },
      ],
      _id: '64e850ee7bf17123b1e5454c',
    },
  ],
};

const mockDataFormUpdatedData = {
  _id: '64e831a0b196d459298df18d',
  type: 'BASIC',
  title: 'Client intake form',
  description: 'Description about the data collected',
  counsellor: '64db4fed192a47efa0ea9838',
  data: [
    {
      name: 'gender',
      type: 'radio',
      displayName: 'First Name',
      required: true,
      options: [
        {
          value: 'false',
          display: 'False',
          target: [],
          _id: '64e850ee7bf17123b1e5454d',
        },
        {
          value: 'male',
          display: 'Male',
          target: [],
          _id: '64e850ee7bf17123b1e5454e',
        },
      ],
      _id: '64e850ee7bf17123b1e5454c',
    },
  ],
};

describe('DataFormService', () => {
  let dataFormService: DataFormService;
  let dataFormModel: Model<DataForm>;
  let counsellorModel: Model<Counsellor>;

  const mockDataFormArray = [
    {
      _id: '64c2085d32b5cbe8a2adff40',
      type: 'BASIC',
      title: 'Client intake form',
      description: 'Description about the data collected',
      data: [
        {
          name: 'gender',
          type: 'radio',
          displayName: 'First Name',
          required: true,
          options: [
            {
              value: 'male',
              display: 'Male',
              target: [],
              _id: '64e82dcb6089e9bc2bbf8dea',
            },
            {
              value: 'female',
              display: 'Female',
              target: [],
              _id: '64e82dcb6089e9bc2bbf8deb',
            },
          ],
          _id: '64e82dcb6089e9bc2bbf8de9',
        },
      ],
    },
    {
      _id: '64e5d67bbe94beedde7171b3',
      type: 'BASIC',
      title: 'Client intake form',
      description: 'Description about the data collected',
      data: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataFormService,
        {
          provide: getModelToken(DataForm.name),
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
      ],
    }).compile();

    dataFormService = module.get<DataFormService>(DataFormService);
    dataFormModel = module.get<Model<DataForm>>(getModelToken(DataForm.name));
    counsellorModel = module.get<Model<Counsellor>>(
      getModelToken(Counsellor.name),
    );
  });

  it('should be defined', () => {
    expect(dataFormService).toBeDefined();
  });

  describe('findAllDataForm', () => {
    it('should find and return an array of all Data Form', async () => {
      jest.spyOn(dataFormModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataFormArray),
      } as any);
      const dataForms = await dataFormService.findAll();

      expect(dataForms).toEqual(mockDataFormArray);
    });
  });

  describe('findOneDataForm', () => {
    it('should find and return a Data Form', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);
      const dataForm = await dataFormService.findSelectedDataForm(
        mockDataForm._id,
      );

      expect(dataForm).toEqual(mockDataForm);
    });

    it('should throw NotFoundException if Data Form is not found', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        dataFormService.findSelectedDataForm(mockDataForm._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Data Form ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidDataFormObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(dataFormService.findSelectedDataForm(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidDataFormObjectId.mockRestore();
    });
  });

  describe('createNewDataForm', () => {
    const counsellor = {
      _id: '64e30f854d2daacb043e1a2c',
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

    const createDataFormDto: CreateDataFormDto = {
      type: 'BASIC',
      title: 'Client intake form',
      description: 'Description about the data collected',
    };

    it('should create a new Data Form and return created Data Form', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValue(counsellor);

      jest
        .spyOn(dataFormModel, 'create')
        .mockImplementationOnce(() =>
          Promise.resolve(mockCreatedDataForm as any),
        );
      const createdDataForm = await dataFormService.create(
        counsellor._id,
        createDataFormDto,
      );

      expect(createdDataForm).toEqual(mockCreatedDataForm);
    });

    it('should throw NotFoundException if Counselor is not found', async () => {
      jest.spyOn(counsellorModel, 'findById').mockResolvedValue(null);

      await expect(
        dataFormService.create(counsellor._id, createDataFormDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if Counselor ID is not valid', async () => {
      const id = 'invalid-id';
      const isValidCounselorObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        dataFormService.create(id, createDataFormDto),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidCounselorObjectId.mockRestore();
    });
  });

  describe('updateDataForm', () => {
    const updatedDataFormDto: UpdateDataFormDto = {
      type: 'BASIC',
      title: 'Client intake form updated',
      description: 'Description about the data collected updated',
    };

    it('should udpated existing Data Form and return updated Data Form', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      jest.spyOn(dataFormModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedDataForm),
      } as any);
      const updatedDataForm = await dataFormService.update(
        mockDataForm._id,
        updatedDataFormDto as UpdateDataFormDto,
      );

      expect(updatedDataForm).toEqual(mockUpdatedDataForm);
    });
  });

  describe('removeDataForm', () => {
    it('should remove and return Data Form given ID', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockCreatedDataForm),
        }),
      } as any);
      const deletedDataForm = await dataFormService.remove(
        mockCreatedDataForm._id,
      );

      expect(deletedDataForm).toEqual(mockCreatedDataForm);
    });
  });

  describe('addDataToDataForm', () => {
    const mockDataDto: CreateData = {
      name: 'gender',
      type: 'radio',
      displayName: 'First Name',
      required: true,
      options: [
        {
          value: 'male',
          display: 'Male',
        },
        {
          value: 'female',
          display: 'Female',
        },
      ],
    };

    it('should add a new Data to a Data Form and return updated Data Form', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      jest.spyOn(dataFormModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataFormAddedData),
      } as any);
      const updatedDataForm = await dataFormService.addData(
        mockCreatedDataForm._id,
        mockDataDto as CreateData,
      );

      expect(updatedDataForm).toEqual(mockDataFormAddedData);
    });

    it('should throw BadRequestException for Data Form basic type with empty displayname', async () => {
      const mockDataDto: CreateData = {
        name: 'gender',
        type: 'radio',
        required: true,
        options: [
          {
            value: 'male',
            display: 'Male',
          },
          {
            value: 'female',
            display: 'Female',
          },
        ],
      };

      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      await expect(
        dataFormService.addData(
          mockCreatedDataForm._id,
          mockDataDto as CreateData,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for Data Form basic type with existing label', async () => {
      const mockDataDto: CreateData = {
        name: 'gender',
        type: 'radio',
        displayName: 'First Name',
        label: 'First Name',
        required: true,
        options: [
          {
            value: 'male',
            display: 'Male',
          },
          {
            value: 'female',
            display: 'Female',
          },
        ],
      };

      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      await expect(
        dataFormService.addData(
          mockCreatedDataForm._id,
          mockDataDto as CreateData,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for Data Form basic type with existing section', async () => {
      const mockDataDto: CreateData = {
        section: 'section1',
        name: 'gender',
        type: 'radio',
        displayName: 'First Name',
        required: true,
        options: [
          {
            value: 'male',
            display: 'Male',
          },
          {
            value: 'female',
            display: 'Female',
          },
        ],
      };

      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      await expect(
        dataFormService.addData(
          mockCreatedDataForm._id,
          mockDataDto as CreateData,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for Data Form dynamic type with empty label', async () => {
      const mockDataDto: CreateData = {
        section: 'section1',
        name: 'gender',
        type: 'radio',
        displayName: 'First Name',
        required: true,
        options: [
          {
            value: 'male',
            display: 'Male',
          },
          {
            value: 'female',
            display: 'Female',
          },
        ],
      };

      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      await expect(
        dataFormService.addData(
          mockCreatedDynamicDataForm._id,
          mockDataDto as CreateData,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for DataForm dynamic type with empty section', async () => {
      const mockDataDto: CreateData = {
        name: 'gender',
        type: 'radio',
        displayName: 'First Name',
        label: 'First Name',
        required: true,
        options: [
          {
            value: 'male',
            display: 'Male',
          },
          {
            value: 'female',
            display: 'Female',
          },
        ],
      };

      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      await expect(
        dataFormService.addData(
          mockCreatedDynamicDataForm._id,
          mockDataDto as CreateData,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeDataFromDataForm', () => {
    it('should remove a Data from a Data Form and return updated Data Form', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      jest.spyOn(dataFormModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);
      const updatedDataForm = await dataFormService.removeData(
        mockDataFormAddedData._id,
        '64e850ee7bf17123b1e5454c',
      );

      expect(updatedDataForm).toEqual(mockDataForm);
    });

    it('should throw NotFoundException if Data is not found in Data Form', async () => {
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      jest.spyOn(dataFormModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      await expect(
        dataFormService.removeData(
          mockDataFormAddedData._id,
          '64e850ee7bf17123b1e5454c',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadException if Data ID is not valid', async () => {
      const isValidDataFormObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);
      jest.spyOn(dataFormModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDataForm),
      } as any);

      const id = 'invalid-id';
      const isValidDataObjectId = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);
      await expect(
        dataFormService.removeData(mockDataFormAddedData._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidDataObjectId.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidDataFormObjectId.mockRestore();
    });
  });
});
