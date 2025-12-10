import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { MeetingDataFormService } from './meeting-data-form.service';
import { Auth } from 'src/config/authorization/auth.decorator';
import { CreateDataFormDto } from './dto/create.meeting.dto';
import { MeetingDataFormParams, MeetingParams } from './dto/query.meeting.dto';

@Controller('meeting')
export class MeetingDataFormController {
  constructor(
    private readonly meetingDataFormService: MeetingDataFormService,
  ) {}

  @Auth('jar')
  @Get(':meetingId/forms/:dataFormId')
  async findDataForm(@Param() params: MeetingDataFormParams) {
    return await this.meetingDataFormService.findSelectedMeetingDataForm(
      params.meetingId,
      params.dataFormId,
    );
  }

  @Auth('jar')
  @Put(':meetingId/forms')
  async addDataForm(
    @Param() params: MeetingParams,
    @Body() linkedForm: CreateDataFormDto,
  ) {
    return await this.meetingDataFormService.addLinkedForm(
      params.meetingId,
      linkedForm.form,
      linkedForm,
    );
  }

  @Auth('jar')
  @Delete(':meetingId/forms/:dataFormId')
  async deleteDataForm(@Param() params: MeetingDataFormParams) {
    return await this.meetingDataFormService.removeDataForm(
      params.meetingId,
      params.dataFormId,
    );
  }
}
