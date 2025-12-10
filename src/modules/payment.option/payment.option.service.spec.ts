import { Test, TestingModule } from '@nestjs/testing';
import { PaymentOptionService } from './payment.option.service';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentOption } from './schemas/payment.option.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePaymentOptionDto } from './dto/create.payment.option.dto';
import { UpdatePaymentOptionDto } from './dto/update.payment.option.dto';

const mockPaymentOption = {
  _id: '64d4910b1373de052a39ad58',
  name: 'Cash at Session',
  description: 'Pay by cash before/after the session',
  enabled: false,
};

const mockCreatedPaymentOption = {
  _id: '64d4910b1373de052a39ad58',
  name: 'Cash at Session',
  description: 'Pay by cash before/after the session',
  enabled: false,
};

const mockUpdatedPaymentOption = {
  _id: '64d4910b1373de052a39ad58',
  name: 'Cash at Session updated',
  description: 'Pay by cash before/after the session updated',
  enabled: false,
};

describe('PaymentService', () => {
  let paymentService: PaymentOptionService;
  let paymentModel: Model<PaymentOption>;

  const mockPaymentOptionsArray = [
    {
      _id: '64d4910b1373de052a39ad58',
      name: 'Cash at Session',
      description: 'Pay by cash before/after the session updated',
      enabled: true,
    },
    {
      _id: '64d4b00d42f9d31575addc5f',
      name: 'Cash at Session',
      description: 'Pay by cash before/after the session',
      enabled: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentOptionService,
        {
          provide: getModelToken(PaymentOption.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    paymentService = module.get<PaymentOptionService>(PaymentOptionService);
    paymentModel = module.get<Model<PaymentOption>>(
      getModelToken(PaymentOption.name),
    );
  });

  it('should be defined', () => {
    expect(paymentService).toBeDefined();
  });

  describe('findAllServices', () => {
    it('should return an array of counsellors', async () => {
      jest.spyOn(paymentModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockPaymentOptionsArray),
      } as any);
      const paymentOptions = await paymentService.findAll();

      expect(paymentOptions).toEqual(mockPaymentOptionsArray);
    });
  });

  describe('findOnePaymentOption', () => {
    it('should return a payment options given by id', async () => {
      jest.spyOn(paymentModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockPaymentOption),
      } as any);
      const paymentOption = await paymentService.findById(
        mockPaymentOption._id,
      );

      expect(paymentOption).toEqual(mockPaymentOption);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(paymentService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      isValidObjectIdMock.mockRestore();
    });

    it('should throw NotFoundException if payment option is not found', async () => {
      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        paymentService.findById(mockPaymentOption._id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPaymentOption', () => {
    it('should create and return a payment option', async () => {
      const newPaymentOptionDto = {
        name: 'Cash at Session',
        description: 'Pay by cash before/after the session',
      };

      jest.spyOn(paymentModel, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: '64d4910b1373de052a39ad58',
          enabled: false,
          ...newPaymentOptionDto,
        } as any),
      );
      const newPaymentOption = await paymentService.createOption(
        newPaymentOptionDto as CreatePaymentOptionDto,
      );

      expect(newPaymentOption).toEqual(mockCreatedPaymentOption);
    });
  });

  describe('updatePaymentOption', () => {
    const updatePaymentOption = {
      name: 'Cash at Session updated',
      description: 'Pay by cash before/after the session updated',
    };

    it('should update and return updated payment option given ID', async () => {
      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockPaymentOption),
      } as any);

      jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedPaymentOption),
      } as any);
      const updatedPaymentOption = await paymentService.updateOption(
        mockPaymentOption._id,
        updatePaymentOption as UpdatePaymentOptionDto,
      );

      expect(updatedPaymentOption).toEqual(mockUpdatedPaymentOption);
    });
  });

  describe('removePaymentOption', () => {
    it('should remove and return removed payment option given ID', async () => {
      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockPaymentOption),
        }),
      } as any);
      const deletedPaymentOption = await paymentService.deleteOption(
        mockPaymentOption._id,
      );

      expect(paymentModel.findById).toHaveBeenCalledWith(mockPaymentOption._id);
      expect(deletedPaymentOption).toEqual(mockPaymentOption);
    });
  });

  describe('changeEnabledValue', () => {
    it('should change enabled true if it is false', async () => {
      const mockDisabledPaymentOption = {
        _id: '64d4910b1373de052a39ad58',
        name: 'Cash at Session',
        description: 'Pay by cash before/after the session updated',
        enabled: false,
      };

      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockDisabledPaymentOption),
      } as any);

      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValueOnce({ modifiedCount: 1 }),
        }),
      } as any);
      const updatedPaymentOption = await paymentService.changeEnabled(
        mockDisabledPaymentOption._id,
      );

      expect(updatedPaymentOption.modifiedCount).toEqual(1);
    });

    it('should change enabled false if it is true', async () => {
      const mockEnabledPaymentOption = {
        _id: '64d4910b1373de052a39ad58',
        name: 'Cash at Session',
        description: 'Pay by cash before/after the session updated',
        enabled: true,
      };

      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockEnabledPaymentOption),
      } as any);

      jest.spyOn(paymentModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValueOnce({ modifiedCount: 1 }),
        }),
      } as any);
      const updatedPaymentOption = await paymentService.changeEnabled(
        mockEnabledPaymentOption._id,
      );

      expect(updatedPaymentOption.modifiedCount).toEqual(1);
    });
  });
});
