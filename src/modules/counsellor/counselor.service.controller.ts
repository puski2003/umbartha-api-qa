import { Param, Body, Controller, Delete, Put } from '@nestjs/common';
import { CounselorServiceService } from './counselor.service.service';
import { CounsellorServiceDto } from './dto/update.counsellor';
import {
  CounsellorParam,
  CounsellorServiceParam,
} from './dto/query.counsellor.dto';
import { Auth } from 'src/config/authorization/auth.decorator';

@Controller('counsellor')
export class CounselorServiceController {
  constructor(private readonly counselorService: CounselorServiceService) {}

  @Auth('jar')
  @Put(':counsellorId/service')
  async updateService(
    @Param() params: CounsellorParam,
    @Body() { services }: CounsellorServiceDto,
  ) {
    return await this.counselorService.updateService(
      params.counsellorId,
      services,
    );
  }

  @Auth('jar')
  @Delete(':counsellor/service/:service')
  async deleteService(@Param() params: CounsellorServiceParam) {
    return await this.counselorService.deleteService(
      params.counsellor,
      params.service,
    );
  }
}
