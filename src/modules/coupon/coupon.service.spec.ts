import mongoose, { Model } from 'mongoose';
import { CouponService } from './coupon.service';
import { Coupon, DiscountType } from './schemas/coupon.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCouponDto, UseCouponDto } from './dto/create.coupon.dto';
import { UpdateCouponDto } from './dto/update.coupon.dto';

const mockFixedCoupon = {
  _id: '64d9a03f016c1178ec163c94',
  name: 'CLIENT 1',
  discountType: 'FIXED',
  amount: 500,
  validThrough: '24-11-2023 12:10',
};
const mockPercentCoupon = {
  _id: '64fe1acc29dda9fc224bbc91',
  name: 'Client 2',
  discountType: 'PERCENT',
  maxDiscount: 1000,
  amount: 10,
  validThrough: '24-11-2023 12:10',
};

describe('CouponService', () => {
  let couponService: CouponService;
  let couponModel: Model<Coupon>;

  const mockCouponsArray = [
    {
      _id: '64d9a03f016c1178ec163c94',
      name: 'Client 1',
      discountType: 'FIXED',
      amount: 500,
      validThrough: '24-11-2023 12:10',
    },
    {
      _id: '64d9a03f016c1178ec163c94',
      name: 'Client 2',
      discountType: 'PERCENT',
      maxDiscount: 1000,
      amount: 10,
      validThrough: '24-11-2023 12:10',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getModelToken(Coupon.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    couponService = module.get<CouponService>(CouponService);
    couponModel = module.get<Model<Coupon>>(getModelToken(Coupon.name));
  });

  it('should be defined', () => {
    expect(couponService).toBeDefined();
  });

  describe('findAllCoupons', () => {
    it('should return an array of coupons', async () => {
      jest.spyOn(couponModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCouponsArray),
      } as any);
      const coupons = await couponService.findAllCoupons();

      expect(coupons).toEqual(mockCouponsArray);
    });
  });

  describe('findOneCoupon', () => {
    it('should return a coupn given by ID', async () => {
      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockFixedCoupon),
      } as any);
      const coupon = await couponService.findOne(mockFixedCoupon._id);

      expect(coupon).toEqual(mockFixedCoupon);
    });

    it('should throw NotFoundException if coupon is not found', async () => {
      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(couponService.findOne(mockFixedCoupon._id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if invalid Id is given', async () => {
      const id = 'invalid-id';
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(couponService.findOne(id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createCoupon', () => {
    it('should create and return coupon with given name', async () => {
      const newCouponDto = {
        discountType: 'FIXED',
        amount: 500,
        validThrough: '24-11-2023 12:10',
      };

      jest.spyOn(couponModel, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: '64d9a03f016c1178ec163c94',
          name: 'CLIENT 1',
          ...newCouponDto,
        } as any),
      );
      const newCoupon = await couponService.createCoupon({
        name: 'Client 1',
        ...(newCouponDto as CreateCouponDto),
      });

      expect(newCoupon).toEqual(mockFixedCoupon);
    });

    it('should create and return coupon with radom 8 digits name', async () => {
      const newCouponDto = {
        discountType: 'FIXED',
        amount: 500,
        validThrough: '24-11-2023 12:10',
      };

      jest.spyOn(couponModel, 'find').mockResolvedValue(mockCouponsArray);
      jest.spyOn(couponModel, 'create').mockImplementationOnce(() =>
        Promise.resolve({
          _id: '64d9a03f016c1178ec163c94',
          name: expect.any(String),
          ...newCouponDto,
        } as any),
      );
      const newCoupon = await couponService.createCoupon(
        newCouponDto as CreateCouponDto,
      );

      expect(newCoupon).toEqual(mockFixedCoupon);
    });
  });

  describe('updateCoupon', () => {
    const updateCoupon = {
      maxDiscount: 1500,
      amount: 12,
      validThrough: '24-11-2023 12:10 updated',
    };

    it('should update and return updated coupon given Id', async () => {
      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockFixedCoupon),
      } as any);

      jest.spyOn(couponModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          _id: '64fe1acc29dda9fc224bbc91',
          name: 'Client 2',
          discountType: 'PERCENT',
          updateCoupon,
        }),
      } as any);
      const updatedCoupon = await couponService.updateSelectedCoupon(
        mockPercentCoupon._id,
        updateCoupon as UpdateCouponDto,
      );

      expect({
        _id: '64fe1acc29dda9fc224bbc91',
        name: 'Client 2',
        discountType: 'PERCENT',
        updateCoupon,
      }).toEqual(updatedCoupon);
    });
  });

  describe('removeCoupon', () => {
    it('should remove and return coupon given ID', async () => {
      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockFixedCoupon),
      } as any);

      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockFixedCoupon),
        }),
      } as any);
      const deletedCoupon = await couponService.deleteSelectedCoupon(
        mockFixedCoupon._id,
      );

      expect(couponModel.findById).toHaveBeenCalledWith(mockFixedCoupon._id);
      expect(deletedCoupon).toEqual(mockFixedCoupon);
    });
  });

  describe('usedCoupon', () => {
    const useCoupon = {
      usedOn: '23-11-2023 12:10',
    };

    it('should updated use property and return coupon given Id', async () => {
      jest.spyOn(couponModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFixedCoupon),
      } as any);

      jest.spyOn(couponModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          mockFixedCoupon,
          useCoupon,
        }),
      } as any);
      const updatedCoupon = await couponService.couponUse(
        mockFixedCoupon._id,
        useCoupon as UseCouponDto,
      );

      expect(couponModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: mockFixedCoupon._id },
        { $set: useCoupon },
        { new: true },
      );
      expect({ mockFixedCoupon, useCoupon }).toEqual(updatedCoupon);
    });
  });
});
