import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  create(@Body() createCourseDto: CreateCourseDto, @UploadedFiles() files: Express.Multer.File[]) {
    // Parse modules if stringified
    if (typeof createCourseDto.modules === 'string') {
        try {
            createCourseDto.modules = JSON.parse(createCourseDto.modules);
        } catch (error) {}
    }
    
    // Parse learningObjectives if stringified
    if (typeof createCourseDto.learningObjectives === 'string') {
      try {
        createCourseDto.learningObjectives = JSON.parse(createCourseDto.learningObjectives);
      } catch (error) {}
    }
    

    
    // Parse videoMetadata if exists
    let videoMetadata = [];
    if (createCourseDto['videoMetadata']) {
      const metadataArray = Array.isArray(createCourseDto['videoMetadata']) 
        ? createCourseDto['videoMetadata'] 
        : [createCourseDto['videoMetadata']];
      videoMetadata = metadataArray.map(m => typeof m === 'string' ? JSON.parse(m) : m);
    }
    
    // Parse testimonials if stringified
    if (typeof createCourseDto.testimonials === 'string') {
      try {
        createCourseDto.testimonials = JSON.parse(createCourseDto.testimonials);
      } catch (error) {}
    }

    console.log('CreateCourseDto Testimonials:', JSON.stringify(createCourseDto.testimonials));
    
    return this.courseService.create(createCourseDto, files, videoMetadata);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.courseService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.courseService.findOne(id);
    console.log('Controller returning:', JSON.stringify(result));
    return result;
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @UploadedFiles() files: Express.Multer.File[]) {
     // Parse modules if stringified
     if (typeof updateCourseDto.modules === 'string') {
        try {
            updateCourseDto.modules = JSON.parse(updateCourseDto.modules);
        } catch (error) {}
    }

    // Parse learningObjectives if stringified
    if (typeof updateCourseDto.learningObjectives === 'string') {
      try {
        updateCourseDto.learningObjectives = JSON.parse(updateCourseDto.learningObjectives);
      } catch (error) {}
    }
    

    
    // Parse testimonials if stringified
    if (typeof updateCourseDto.testimonials === 'string') {
      try {
        updateCourseDto.testimonials = JSON.parse(updateCourseDto.testimonials);
      } catch (error) {}
    }

    console.log('UpdateCourseDto Testimonials:', JSON.stringify(updateCourseDto.testimonials));
    
    // Parse videoMetadata if exists
    let videoMetadata = [];
    if (updateCourseDto['videoMetadata']) {
      const metadataArray = Array.isArray(updateCourseDto['videoMetadata']) 
        ? updateCourseDto['videoMetadata'] 
        : [updateCourseDto['videoMetadata']];
      videoMetadata = metadataArray.map(m => typeof m === 'string' ? JSON.parse(m) : m);
    }
    
    return this.courseService.update(id, updateCourseDto, files, videoMetadata);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Delete(':id/video')
  deleteVideo(@Param('id') id: string, @Body() body: { videoUrl: string }) {
    return this.courseService.deleteVideo(id, body.videoUrl);
  }
}
