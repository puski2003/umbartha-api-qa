import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CounsellorService } from './counsellor.service';
import {
  ChangeStatusDto,
  CreateCounselorDto,
} from './dto/create.counsellor.dto';
import { Auth } from 'src/config/authorization/auth.decorator';
import { User } from 'src/config/authorization/user.decorator';
import {
  CounsellorParam,
  GallerQueryDto,
  CounsellorQueryDto,
  ProfilePictureParams,
  CounsellorEmailParams,
} from './dto/query.counsellor.dto';
import { UpdateCounselorDto } from './dto/update.counsellor';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('counsellor')
export class CounselorController {
  constructor(private readonly counsellorService: CounsellorService) {}

  @Auth('jar')
  @Get()
  async findAllCounselor(
    @User() user: User,
    @Query() query: CounsellorQueryDto,
  ) {
    return await this.counsellorService.findAll(
      user,
      query.limit,
      query.page,
      query,
    );
  }

  @Auth('jar')
  @Get(':counsellorId')
  async findOneCounselor(@Param() param: CounsellorParam) {
    return await this.counsellorService.findSelectedCounsellor(
      param.counsellorId,
    );
  }

  /**
   * endpoint use for get counsellor for auth0 actions
   * don't remove and don't secure this
   */
  @Get('email/:email')
  async getByEmail(@Param() { email }: CounsellorEmailParams) {
    return await this.counsellorService.findByEmail(email);
  }

  @Auth('jar')
  @Post()
  async createCounselor(
    @User() user: User,
    @Body() counsellor: CreateCounselorDto,
  ) {
    return await this.counsellorService.createCounsellor(user, counsellor);
  }

  @Auth('jar')
  @Patch(':counsellorId')
  async updateCounselor(
    @Param() param: CounsellorParam,
    @Body() updateCounselorDto: UpdateCounselorDto,
  ) {
    return await this.counsellorService.updateCounsellor(
      param.counsellorId,
      updateCounselorDto,
    );
  }

  @Auth('jar')
  @Delete(':counsellorId')
  async removeOneCounselor(@Param() param: CounsellorParam) {
    return await this.counsellorService.deleteCounsellor(param.counsellorId);
  }

  @Get('profile/profile-picture')
  async getImage(@Query() gallery: GallerQueryDto, @Res() res: Response) {
    const fileStream = await this.counsellorService.getProfilePic(gallery.key);

    res.set({
      'Content-Type': gallery.mimetype,
    });
    fileStream.pipe(res);
  }

  @Auth('tpw')
  @Put(':counsellorId/profile/profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param() params: CounsellorParam,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({maxSize: 1000}),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|svg)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.counsellorService.addProfilePicToCounsellor(
      params.counsellorId,
      file,
    );
  }

  @Auth('nqa')
  @Delete(':counsellorId/profile/profile-picture/:profilePictureId')
  async deletePhoto(@Param() params: ProfilePictureParams) {
    return await this.counsellorService.removeProfilePicFromCounsellor(
      params.counsellorId,
      params.profilePictureId,
    );
  }

  @Auth('jar')
  @Patch(':counsellorId/status')
  async changeStatus(
    @Param() param: CounsellorParam,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return await this.counsellorService.statusChange(
      param.counsellorId,
      changeStatusDto,
    );
  }

  @Auth('jar')
  @Get('dashboard/counsellor')
  async getAllCounsellorsForDashboard(
    @User() user: User,
    @Query() { limit, page }: CounsellorQueryDto,
  ) {
    return await this.counsellorService.getCounsellorsForDashboard(
      user,
      limit,
      page,
    );
  }
}
