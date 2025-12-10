import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FAQ } from './schema/faq.schema';
import { Model } from 'mongoose';
import { isEmpty, isNotEmpty } from 'class-validator';
import { CerateFaqI, UpdateFaqI } from './faq.types';
import { User } from 'src/config/authorization/user.decorator';

const T = {
  faqNotFound: 'faq is not found',
  invalidOrderNumber:
    'order number provided is not the next sequential order number',
};

@Injectable()
export class FaqService {
  constructor(@InjectModel(FAQ.name) private readonly faqModel: Model<FAQ>) {}

  async findAll(limit: number, page: number) {
    const totalDocs = await this.faqModel.countDocuments();
    const totalPages = Math.ceil(totalDocs / limit);

    const faqsCheck = await this.faqModel
      .find()
      .limit(limit)
      .skip(limit * (page - 1))
      .lean()
      .sort({ order: 1 });

    return {
      docs: faqsCheck,
      pagination: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: limit,
        nextPage: page + 1,
        page: page,
        prevPage: page - 1,
        totalDocs: totalDocs,
        totalPages: totalPages,
      },
    };
  }

  async findSelectedFaq(faqId: string) {
    const faqCheck = await this.faqModel.findById(faqId).lean();

    if (isEmpty(faqCheck)) {
      Logger.error(T.faqNotFound.toUpperCase());
      throw new NotFoundException(T.faqNotFound);
    }

    return faqCheck;
  }

  async createFaq(
    faq: CerateFaqI,
    user: User = {
      user: 'system-user',
      scope: '',
      isSuperAdmin: true,
      isAdmin: true,
      isStaffManager: false,
      isStaff: false,
      isCounsellor: false,
      counsellor: '',
    },
  ) {
    if (isNotEmpty(faq.order) && faq.order !== 1) {
      await this.faqModel.find({ order: faq.order - 1 }).then(async (d) => {
        if (isEmpty(d[0])) {
          throw new BadRequestException(T.invalidOrderNumber);
        }
      });
    }

    if (isEmpty(faq.order) || faq.order === 1) {
      await this.faqModel.countDocuments().then(async (d) => {
        faq.order = d + 1;
      });
    }

    await this.faqModel.findOne({ order: faq.order }).then(async (d) => {
      if (isNotEmpty(d)) {
        for (const faqCheck of (await this.findAll(undefined, undefined))
          .docs) {
          if (faqCheck.order >= faq.order) {
            await this.faqModel.findByIdAndUpdate(
              faqCheck._id,
              {
                $set: { order: faqCheck.order + 1 },
              },
              { new: true, lean: true },
            );
          }
        }
      }
    });

    const createdFaq = await this.faqModel.create({
      ...faq,
      createdBy: user.user,
    });
    return createdFaq;
  }

  async updateSelectedFaq(faqId: string, faq: UpdateFaqI) {
    await this.findSelectedFaq(faqId);

    const updatedFaq = await this.faqModel.findByIdAndUpdate(
      faqId,
      {
        $set: faq,
      },
      { new: true, lean: true },
    );
    return updatedFaq;
  }

  async deleteSelectedFaq(faqId: string) {
    const faqCheck = await this.findSelectedFaq(faqId);

    await this.findAll(undefined, undefined).then(async (faqs) => {
      for (const faq of faqs.docs) {
        if (faqCheck.order < faq.order) {
          await this.faqModel.findByIdAndUpdate(
            faq._id,
            { $set: { order: faq.order - 1 } },
            { new: true, lean: true },
          );
        }
      }
    });

    const deletedFaq = await this.faqModel.findByIdAndRemove(faqId).lean();
    return deletedFaq;
  }

  async orderChangeSelectedFaq(faqId: string, order: number) {
    const faqCheck = await this.faqModel
      .findOne({
        _id: faqId,
        $or: [{ order: order + 1 }, { order: order - 1 }],
      })
      .then(async (d) => {
        if (isEmpty(d)) {
          Logger.warn(T.faqNotFound.toUpperCase());
          throw new NotFoundException(T.faqNotFound);
        }
        return d;
      });

    if (faqCheck.order < order) {
      await this.faqModel.findOneAndUpdate(
        { order: order },
        { $set: { order: order - 1 } },
        { new: true, lean: true },
      );
    } else {
      await this.faqModel.findOneAndUpdate(
        { order: order },
        { $set: { order: order + 1 } },
        { new: true, lean: true },
      );
    }

    const updatedFaq = await this.faqModel.findByIdAndUpdate(
      faqId,
      {
        $set: { order: order },
      },
      { new: true, lean: true },
    );

    return updatedFaq;
  }
}
