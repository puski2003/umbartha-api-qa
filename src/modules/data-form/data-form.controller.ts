import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { DataFormService } from './data-form.service';
import {
  CreateData,
  CreateDataFormDto,
  DataFormParam,
  RemoveDataParam,
  UpdateData,
  UpdateDataFormDto,
} from './dto/data-form.dto';
import { User } from 'src/config/authorization/user.decorator';
import { Auth } from 'src/config/authorization/auth.decorator';

@Controller('data-form')
export class DataFormController {
  constructor(private readonly dataFormService: DataFormService) {}

  @Auth('jar')
  @Get()
  findAll(@User() user: User) {
    return this.dataFormService.findAll(user);
  }

  @Auth('jar')
  @Get('/:dataFormId')
  findOne(@User() user: User, @Param() param: DataFormParam) {
    return this.dataFormService.findSelectedDataForm(param.dataFormId);
  }

  @Auth('jar')
  @Post('/counsellor/:counsellorId')
  crete(
    @User() user: User,
    @Param('counsellorId') counsellorId: string,
    @Body() createDataFormDto: CreateDataFormDto,
  ) {
    return this.dataFormService.create(user, counsellorId, createDataFormDto);
  }

  @Auth('jar')
  @Patch('/:dataFormId')
  update(
    @User() user: User,
    @Param() param: DataFormParam,
    @Body() updateDataFormDto: UpdateDataFormDto,
  ) {
    return this.dataFormService.update(
      user,
      param.dataFormId,
      updateDataFormDto,
    );
  }

  @Auth('jar')
  @Delete('/:dataFormId')
  remove(@User() user: User, @Param() param: DataFormParam) {
    return this.dataFormService.remove(user, param.dataFormId);
  }

  @Auth('jar')
  @Put('/:dataFormId/data')
  addData(
    @User() user: User,
    @Param() param: DataFormParam,
    @Body() datas: Array<CreateData>,
  ) {
    for (let i = 0; i < datas.length; i++) {
      this.dataFormService.addData(user, param.dataFormId, datas[i]);
    }
  }

  @Auth('jar')
  @Patch('/:dataFormId/data')
  async updateData(
    @User() user: User,
    @Param() param: DataFormParam,
    @Body() updateDatas: Array<UpdateData>,
  ) {
    for (let i = 0; i < updateDatas.length; i++) {
      await this.dataFormService.updateData(
        user,
        param.dataFormId,
        updateDatas[i]._id,
        updateDatas[i],
      );
    }
  }

  @Auth('jar')
  @Delete('/:dataFormId/data/:dataId')
  removeData(@User() user: User, @Param() param: RemoveDataParam) {
    return this.dataFormService.removeData(
      user,
      param.dataFormId,
      param.dataId,
    );
  }
}
