import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DataForm } from './schemas/data-form.schema';
import { Model } from 'mongoose';
import {
  CreateDataFormDto,
  CreateData,
  UpdateDataFormDto,
  UpdateData,
} from './dto/data-form.dto';
import { User } from 'src/config/authorization/user.decorator';
import { CounsellorService } from '../counsellor/counsellor.service';
import { isEmpty } from 'class-validator';

const T = {
  dataFormNotFound: 'data form is not found',
};

@Injectable()
export class DataFormService {
  constructor(
    @InjectModel(DataForm.name) private readonly dataFormModel: Model<DataForm>,
    private readonly counsellorService: CounsellorService,
  ) {}

  /**
   * retrieve and return a array of all Data Forms
   * @returns {Promise<DataForm[]>} promise that resolves with an array of all Data Forms
   */
  async findAll(user: User): Promise<DataForm[]> {
    if (user.isCounsellor) {
      const checkForDataForms = await this.dataFormModel
        .find()
        .lean()
        .populate([
          {
            path: 'counsellor',
            select: 'profilePictureURL title displayName',
          },
        ]);
      for (let i = 0; i < checkForDataForms.length; i++) {
        if (checkForDataForms)
          checkForDataForms[i].data.sort((a, b) => a.order - b.order);
      }
      return checkForDataForms;
    }

    const checkForDataForms = await this.dataFormModel
      .find()
      .sort({ createdAt: -1 })
      .populate([
        {
          path: 'counsellor',
          select: 'profilePictureURL title displayName',
        },
      ])
      .lean();
    for (let i = 0; i < checkForDataForms.length; i++) {
      if (checkForDataForms)
        checkForDataForms[i].data.sort((a, b) => a.order - b.order);
    }
    return checkForDataForms;
  }

  /**
   * find and retrieve a Data Form by its ID from the database
   * @param {string} dataFormId - ID of the Data Form to retrieve
   * @returns {Promise<DataForm>} promise that resolves with the retrieved Data Form
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId.
   * @throws {NotFoundException} throws if no Data Form with the provided ID is found.
   */
  async findSelectedDataForm(dataFormId: string): Promise<DataForm> {
    const dataFormCheck = await this.dataFormModel
      .findById(dataFormId)
      .lean()
      .populate([
        {
          path: 'counsellor',
          select: 'profilePictureURL title displayName',
        },
      ]);

    if (isEmpty(dataFormCheck)) {
      throw new NotFoundException(T.dataFormNotFound);
    }

    dataFormCheck.data.sort((a, b) => a.order - b.order);
    return dataFormCheck;
  }

  /**
   * creates a new Data Form with a Counselor based on the provided data
   * @param {string} counsellorId - ID of the Counselor associated with the Data Form
   * @param {CreateDataFormDto} createDataFormDto - data for creating the Data Form
   * @returns {Promise<DataForm>} - promise that resolves to the created Data Form
   * @throws {BadRequestException} throws if the provided Counselor ID is not a valid ObjectId.
   * @throws {NotFoundException} throws if no Counselor with the provided ID is found.
   */
  async create(
    user: User,
    counsellorId: string,
    createDataFormDto: CreateDataFormDto,
  ): Promise<DataForm> {
    await this.counsellorService.findSelectedCounsellor(counsellorId);

    const dataForm = await this.dataFormModel.create({
      createdBy: user.user,
      ...createDataFormDto,
    });
    return dataForm;
  }

  /**
   * updates a data form based on provided data and ID
   * @param {string} id - ID of the Data Form to update
   * @param {UpdateDataFormDto} updateDataFormDto - updated data for the Data Form
   * @returns {Promise<DataForm>} promise that resolves to the updated Data Form
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId
   * @throws {NotFoundException} throws if no Data Form with the provided ID is found
   */
  async update(
    user: User,
    id: string,
    updateDataFormDto: UpdateDataFormDto,
  ): Promise<DataForm> {
    await this.findSelectedDataForm(id);

    const updatedDataForm = await this.dataFormModel
      .findByIdAndUpdate(
        { _id: id },
        { $set: updateDataFormDto },
        { new: true },
      )
      .exec();
    return updatedDataForm;
  }

  /**
   * removes a Data Form by its ID
   * @param {string} id - ID of the Data Form to remove
   * @returns {Promise<DataForm>} promise that resolves to the removed Data Form
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId.
   * @throws {NotFoundException} throws if no Data Form with the provided ID is found.
   */
  async remove(user: User, id: string): Promise<DataForm> {
    await this.findSelectedDataForm(id);

    const deletedDataForm = await this.dataFormModel.findByIdAndDelete(id);
    return deletedDataForm;
  }

  /**
   * add a Data Form to an existing Data Form based on the provided data
   * @param {string} id - ID of the Data Form to which the Data should
   * @param {CreateData} createData - data to add to the Data Form
   * @returns {Promise<DataForm>} promise that resolves with the updated Data Form
   * @throws {BadRequestException} throws if the provided ID is not a valid ObjectId
   *   or if the provided data does not meet the requirements for the Data Form type
   * @throws {NotFoundException} throws if no Data Form with the provided ID is found
   */
  async addData(
    user: User,
    id: string,
    createData: CreateData,
  ): Promise<DataForm> {
    const checkForDataForm = await this.findSelectedDataForm(id);

    if (checkForDataForm.type.toString() == 'DYNAMIC' && !createData.section)
      throw new BadRequestException(`section should not be empty`);
    else if (checkForDataForm.type.toString() == 'DYNAMIC' && !createData.label)
      throw new BadRequestException(`label should not be empty`);
    else if (checkForDataForm.type.toString() == 'BASIC' && createData.section)
      throw new BadRequestException(`property section should not exist`);
    else if (checkForDataForm.type.toString() == 'BASIC' && createData.label)
      throw new BadRequestException(`property label should not exist`);
    else if (
      checkForDataForm.type.toString() == 'BASIC' &&
      !createData.displayName
    )
      throw new BadRequestException(`displayName should not be empty`);

    const updatedDataForm = await this.dataFormModel
      .findByIdAndUpdate(
        {
          _id: id,
        },
        { $push: { data: createData } },
        { new: true },
      )
      .exec();
    return updatedDataForm;
  }

  /**
   * update a data in a data form
   * @param {string} dataFormId - ID of the Data Form containing the Data to update
   * @param {string} dataId - ID of the Data to update
   * @param {UpdateData} updateData - updated data to apply
   * @returns {Promise<DataForm>} promise that resolves with the updated Data Form
   * @throws {BadRequestException} throws if the provided data form ID or Data ID is not a valid ObjectId
   * @throws {NotFoundException} throws if no data form with the provided data form ID is found
   */
  async updateData(
    user: User,
    dataFormId: string,
    dataId: string,
    updateData: UpdateData,
  ): Promise<DataForm> {
    await this.findSelectedDataForm(dataFormId);

    const updatedDataForm = await this.dataFormModel
      .findOneAndUpdate(
        {
          'data._id': dataId,
        },
        {
          $set: {
            'data.$.order': updateData.order,
          },
        },
        { new: true },
      )
      .exec();
    if (!updatedDataForm)
      throw new NotFoundException(`Data #${dataId} is not found`);
    return updatedDataForm;
  }

  /**
   * removes Data from a Data Form
   * @param {string} dataFormId - ID of the Data Form to remove Data
   * @param {string} dataId - ID of the Data to remove
   * @returns {Promise<DataForm>} promise that resolves with the updated data form after data removal
   * @throws {BadRequestException} throws if the provided Data Form ID or Data ID is not a valid ObjectId
   * @throws {NotFoundException} Throws if no Data Form or Data with the provided data form ID is found
   */
  async removeData(
    user: User,
    dataFormId: string,
    dataId: string,
  ): Promise<DataForm> {
    await this.findSelectedDataForm(dataFormId);

    const updatedDataForm = await this.dataFormModel
      .findOneAndUpdate(
        {
          'data._id': dataId,
        },
        { $pull: { data: { _id: dataId } } },
        { new: true },
      )
      .exec();
    if (!updatedDataForm)
      throw new NotFoundException(`Data #${dataId} is not found`);
    return updatedDataForm;
  }
}
