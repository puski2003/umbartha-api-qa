import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course } from './schema/course.schema';
import { CreateCourseDto } from './dto/create.course.dto';
import { UpdateCourseDto } from './dto/update.course.dto';
import { COURSE_COLLECTION } from './course.constants';
import { S3Service } from 'src/config/aws/aws-s3/service';
import { Readable } from 'stream';
import { COUNSELLOR_COLLECTION } from '../counsellor/counsellor.constants';
import { Counsellor } from '../counsellor/schemas/counsellor.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(COURSE_COLLECTION) private readonly courseModel: Model<Course>,
    @InjectModel(COUNSELLOR_COLLECTION) private readonly counsellorModel: Model<Counsellor>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const totalDocs = await this.courseModel.countDocuments().exec();
    const totalPages = Math.ceil(totalDocs / limit);

    const docs = await this.courseModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Populate instructor details for each course
    const populatedDocs = await Promise.all(docs.map(async (course) => {
      if (course.instructorId) {
        const instructor = await this.counsellorModel.findById(course.instructorId).select('displayName firstName lastName profilePictureURL description').lean().exec();
        return { ...course, instructor };
      }
      return course;
    }));

    return {
      docs: populatedDocs,
      pagination: {
        totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    };
  }

  async findOne(id: string) {
    const course = await this.courseModel.findById(id).lean().exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    if (course.instructorId) {
      console.log('Populating instructor for course:', id);
      console.log('Instructor ID:', course.instructorId);
      try {
        // Try finding by ID directly
        let instructor = await this.counsellorModel.findById(course.instructorId).select('displayName firstName lastName profilePictureURL description').lean().exec();
        
        // If not found, try casting to ObjectId
        if (!instructor) {
             console.log('Instructor not found with string ID, trying ObjectId cast...');
             try {
                 const objectId = new Types.ObjectId(course.instructorId);
                 instructor = await this.counsellorModel.findOne({ _id: objectId }).select('displayName firstName lastName profilePictureURL description').lean().exec();
             } catch (e) {
                 console.log('Invalid ObjectId:', course.instructorId);
             }
        }

        if (instructor) {
            console.log('Found instructor:', instructor.displayName);
            const result = { ...course, instructor };
            console.log('Service returning:', JSON.stringify(result));
            return result;
        } else {
            console.log('Instructor NOT found even after cast.');
            const count = await this.counsellorModel.countDocuments().exec();
            console.log('Total counsellors in collection:', count);
            const sample = await this.counsellorModel.findOne().exec();
            console.log('Sample counsellor ID:', sample?._id);
        }
      } catch (error) {
        console.error('Error populating instructor:', error);
      }
    }
    
    return course;
  }

  async create(createCourseDto: CreateCourseDto, files?: Express.Multer.File[], videoMetadata?: any[]) {
    let thumbnail = '';
    let demoVideoUrl = '';
    const videoFiles = [];
    
    //Separate thumbnail, demo video, and module videos
    if (files && files.length > 0) {
      const thumbnailFile = files.find(f => f.fieldname === 'thumbnail');
      if (thumbnailFile) {
        const uploadResult = await this.uploadImage(thumbnailFile);
        thumbnail = uploadResult.url;
      }
      
      // Handle demo video upload
      const demoVideoFile = files.find(f => f.fieldname === 'demoVideo');
      if (demoVideoFile) {
        const videoKey = `course/demo-videos/${new Date().getTime()}-${demoVideoFile.originalname}`;
        await this.s3Service.uploadObjectToBucket(
          process.env.S3_UMBARTHA_BUCKET_NAME, 
          videoKey, 
          demoVideoFile.buffer
        );
        demoVideoUrl = `https://${process.env.S3_UMBARTHA_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${videoKey}`;
      }
      
      // Get module video files
      videoFiles.push(...files.filter(f => f.fieldname === 'videos'));
    }

    // Upload videos and update module structure
    const updatedModules = await this.processVideoUploads(
      createCourseDto.modules, 
      videoFiles, 
      videoMetadata
    );

    // Parse showContentPreview to boolean (it comes as string from FormData)
    const showContentPreview = (createCourseDto.showContentPreview as any) === 'true' || createCourseDto.showContentPreview === true;

    const newCourse = new this.courseModel({
      ...createCourseDto,
      thumbnail,
      demoVideoUrl,
      showContentPreview,
      modules: updatedModules,
    });
    return await newCourse.save();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, files?: Express.Multer.File[], videoMetadata?: any[]) {
    const existingCourse = await this.findOne(id);
    let thumbnail = existingCourse.thumbnail;
    let demoVideoUrl = existingCourse.demoVideoUrl;

    const videoFiles = [];
    
    // Separate thumbnail, demo video, and module videos
    if (files && files.length > 0) {
      const thumbnailFile = files.find(f => f.fieldname === 'thumbnail');
      if (thumbnailFile) {
        const uploadResult = await this.uploadImage(thumbnailFile);
        thumbnail = uploadResult.url;
      }
      
      // Handle demo video upload
      const demoVideoFile = files.find(f => f.fieldname === 'demoVideo');
      if (demoVideoFile) {
        const videoKey = `course/demo-videos/${new Date().getTime()}-${demoVideoFile.originalname}`;
        await this.s3Service.uploadObjectToBucket(
          process.env.S3_UMBARTHA_BUCKET_NAME, 
          videoKey, 
          demoVideoFile.buffer
        );
        demoVideoUrl = `https://${process.env.S3_UMBARTHA_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${videoKey}`;
      }
      
      // Get module video files and resource files
      // We push all other files that are not thumbnail or demoVideo
      const otherFiles = files.filter(f => f.fieldname !== 'thumbnail' && f.fieldname !== 'demoVideo');
      videoFiles.push(...otherFiles);
    }

    // Upload videos and update module structure
    const updatedModules = await this.processVideoUploads(
      updateCourseDto.modules || existingCourse.modules, 
      videoFiles, 
      videoMetadata
    );

    // Parse showContentPreview to boolean (it comes as string from FormData)
    const showContentPreview = (updateCourseDto.showContentPreview as any) === 'true' || updateCourseDto.showContentPreview === true;

    return await this.courseModel.findByIdAndUpdate(
      id,
      { 
        ...updateCourseDto, 
        thumbnail, 
        demoVideoUrl, 
        showContentPreview,
        modules: updatedModules 
      },
      { new: true },
    ).exec();
  }

  private async processVideoUploads(modules: any[], allFiles: Express.Multer.File[], videoMetadata: any[]) {
    if (!allFiles || allFiles.length === 0) {
      return modules;
    }

    // Create a map of video metadata by index
    const metadataMap = new Map();
    if (videoMetadata) {
      videoMetadata.forEach((meta, index) => {
        const key = `${meta.moduleIndex}-${meta.videoIndex}`;
        metadataMap.set(key, { ...meta, fileIndex: index });
      });
    }

    // Separate video files and resource files based on fieldname
    // We assume fieldname format: 'videos' for video files, 'resources-[mIndex]-[vIndex]' for resource files
    const videoFiles = allFiles.filter(f => f.fieldname === 'videos');
    const resourceFiles = allFiles.filter(f => f.fieldname.startsWith('resources-'));

    // Process modules and upload videos
    const updatedModules = await Promise.all(modules.map(async (module, mIndex) => {
      if (!module.videos || module.videos.length === 0) {
        return module;
      }

      const updatedVideos = await Promise.all(module.videos.map(async (video, vIndex) => {
        const key = `${mIndex}-${vIndex}`;
        const metadata = metadataMap.get(key);
        
        let videoData = { ...video };

        // Handle video file upload
        if (metadata && videoFiles[metadata.fileIndex]) {
          // Upload video to S3
          const videoFile = videoFiles[metadata.fileIndex];
          const videoKey = `course/videos/${new Date().getTime()}-${videoFile.originalname}`;
          await this.s3Service.uploadObjectToBucket(
            process.env.S3_UMBARTHA_BUCKET_NAME, 
            videoKey, 
            videoFile.buffer
          );
          
          videoData.title = metadata.title || video.title;
          videoData.videoUrl = `https://${process.env.S3_UMBARTHA_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${videoKey}`;
          videoData.duration = metadata.duration || video.duration;
        }

        // Handle resource files upload
        if (video.resources && video.resources.length > 0) {
          const processedResources = await Promise.all(video.resources.map(async (resource: any, rIndex: number) => {
            // Keep existing resource if it has a URL and no new file is uploaded for this index
            // But we might want to update the title if it changed
            if (resource.url && !resourceFiles.some(f => f.fieldname === `resources-${mIndex}-${vIndex}-${rIndex}`)) {
              return {
                title: resource.title,
                url: resource.url,
                type: resource.type
              };
            }

            // Check for new file upload for this specific resource index
            const file = resourceFiles.find(f => f.fieldname === `resources-${mIndex}-${vIndex}-${rIndex}`);
            
            if (file) {
              const resourceKey = `course/resources/${new Date().getTime()}-${file.originalname}`;
              await this.s3Service.uploadObjectToBucket(
                process.env.S3_UMBARTHA_BUCKET_NAME,
                resourceKey,
                file.buffer
              );

              return {
                title: resource.title || file.originalname, // Use title from metadata if available, else filename
                url: `https://${process.env.S3_UMBARTHA_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${resourceKey}`,
                type: file.mimetype
              };
            }

            // If it has no URL and no file found, it's likely a malformed entry or file missing, return null to filter out
            return null;
          }));

          // Filter out nulls
          videoData.resources = processedResources.filter(r => r !== null);
        } else {
          // If no resources in input, ensure it's empty (or keep undefined if schema allows, but empty array is safer)
          videoData.resources = [];
        }
        
        return videoData;
      }));

      return {
        ...module,
        videos: updatedVideos,
      };
    }));

    return updatedModules;
  }

  async remove(id: string) {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return deletedCourse;
  }

  async deleteVideo(courseId: string, videoUrl: string) {
    try {
      console.log('Attempting to delete video. CourseId:', courseId, 'URL:', videoUrl);
      
      // Extract the S3 key from the URL
      const urlParts = videoUrl.split('.com/');
      if (urlParts.length < 2) {
        console.error('Invalid video URL format for splitting:', videoUrl);
        throw new Error('Invalid video URL format');
      }
      
      const key = urlParts[1];
      const bucketName = process.env.S3_UMBARTHA_BUCKET_NAME;
      
      console.log('Extracted Key:', key);
      console.log('Bucket Name:', bucketName);
      
      // Delete from S3
      await this.s3Service.deleteObjectFromBucket(bucketName, key);
      console.log('S3 deletion command sent');
      
      console.log('S3 deletion command sent');
      
      // Update the database to remove the video URL
      // Use $set to clear specific fields or scan modules
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException(`Course with ID ${courseId} not found`);
      }

      if (course.demoVideoUrl === videoUrl) {
         await this.courseModel.findByIdAndUpdate(courseId, {
           $set: { 
             demoVideoUrl: null,
             demoVideoDuration: null 
           }
         });
      } else {
        // It's a module video - find and update it
        // We need to find the specific module and video index to update
        let moduleIndex = -1;
        let videoIndex = -1;

        course.modules.forEach((mod, mIdx) => {
          mod.videos.forEach((vid, vIdx) => {
            if (vid.videoUrl === videoUrl) {
              moduleIndex = mIdx;
              videoIndex = vIdx;
            }
          });
        });

        if (moduleIndex !== -1 && videoIndex !== -1) {
          const updatePathUrl = `modules.${moduleIndex}.videos.${videoIndex}.videoUrl`;
          const updatePathDuration = `modules.${moduleIndex}.videos.${videoIndex}.duration`;
          
          await this.courseModel.findByIdAndUpdate(courseId, {
            $set: {
              [updatePathUrl]: '',
              [updatePathDuration]: ''
            }
          });
        }
      }
      
      console.log('Database updated successfully');
      
      return { success: true, message: 'Video deleted successfully from S3 and database' };
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  async uploadImage(file: Express.Multer.File) {
    const key = `course/thumbnails/${new Date().getTime()}-${file.originalname}`;
    await this.s3Service.uploadObjectToBucket(process.env.S3_UMBARTHA_BUCKET_NAME, key, file.buffer);
    
    return {
      url: `https://${process.env.S3_UMBARTHA_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${key}`,
      key: key
    };
  }
}
