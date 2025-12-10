import mongoose, { Model } from 'mongoose';
import { LocationService } from './location.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../media/media.service';
import { getModelToken } from '@nestjs/mongoose';
import { Location, Type } from './schemas/location.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateClosedDatePlaneDto,
  CreateLocationDto,
  UploadGalleryDto,
} from './dto/create.location.dto';
import { UpdateLocationDto } from './dto/update.location.dto';

const mockLocation = {
  name: 'Meeting Room',
  meetingRoom: false,
  _id: '64df0f75d007e58ada2a0291',
  gallery: [],
  closedDatePlan: [],
};

const mockCreateLocation = {
  name: 'Meeting Room',
  meetingRoom: false,
  _id: '64df0f75d007e58ada2a0291',
  gallery: [],
  closedDatePlan: [],
};

const mockUpdateLocation = {
  name: 'Main Room',
  meetingRoom: false,
  _id: '64df0f75d007e58ada2a0291',
  gallery: [],
  closedDatePlan: [],
};

const mockGalleryUpdateLocation = {
  _id: '64df46567bd7682a77fd09b9',
  name: 'Meeting Room',
  meetingRoom: false,
  gallery: [
    {
      url: 'media/image/locationGallery/64df46567bd7682a77fd09b91692354148508-What.jpg',
      public: true,
      _id: '64df46647bd7682a77fd09bc',
    },
  ],
  closedDatePlan: [],
};

const mockClosedDatePlanUpdateLocation = {
  _id: '64df46567bd7682a77fd09b9',
  name: 'Meeting Room',
  meetingRoom: false,
  gallery: [
    {
      url: 'media/image/locationGallery/64df46567bd7682a77fd09b91692354148508-What.jpg',
      public: true,
      _id: '64df46647bd7682a77fd09bc',
    },
  ],
  closedDatePlan: [
    {
      type: 'DAY',
      pattern: 'xxxx',
      value: 'xxxx',
      _id: '64df46697bd7682a77fd09bf',
    },
  ],
};

describe('LocatioService', () => {
  let locationService: LocationService;
  let locationModel: Model<Location>;
  let mediaService: MediaService;

  const mockLocationsArray = [
    {
      _id: '64df46567bd7682a77fd09b9',
      name: 'Meeting Room',
      meetingRoom: false,
      gallery: [
        {
          url: 'http://localhost:3000/media/image/locationGallery/64df46567bd7682a77fd09b91692354148508-What.jpg',
          public: true,
          _id: '64df46647bd7682a77fd09bc',
        },
      ],
      closedDatePlan: [
        {
          type: 'DAY',
          pattern: 'xxxx',
          value: 'xxxx',
          _id: '64df46697bd7682a77fd09bf',
        },
      ],
    },
    {
      _id: '64df46567bd7682a77fd09b9',
      name: 'Meeting Room',
      meetingRoom: false,
      gallery: [
        {
          url: 'http://localhost:3000/media/image/locationGallery/64df46567bd7682a77fd09b91692354148508-What.jpg',
          public: true,
          _id: '64df46647bd7682a77fd09bc',
        },
      ],
      closedDatePlan: [
        {
          type: 'DAY',
          pattern: 'xxxx',
          value: 'xxxx',
          _id: '64df46697bd7682a77fd09bf',
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: getModelToken(Location.name),
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: {
            upload: jest.fn(),
          },
        },
      ],
    }).compile();

    locationService = module.get<LocationService>(LocationService);
    locationModel = module.get<Model<Location>>(getModelToken(Location.name));
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(locationService).toBeDefined();
  });

  describe('findAllLocations', () => {
    it('should return an array of Locations', async () => {
      jest.spyOn(locationModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocationsArray),
      } as any);
      const location = await locationService.findAll();

      expect(location).toEqual(mockLocationsArray);
    });
  });

  describe('findOneLocation', () => {
    it('should return a location given by ID', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCreateLocation),
      } as any);
      const location = await locationService.findSelectedLocation'(mockCreateLocation._id);

      expect(location).toEqual(mockCreateLocation);
    });

    it('should throw NotFoundExeption if Location is not found', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        locationService.findSelectedLocation'(mockCreateLocation._id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid ID is given', async () => {
      const id = 'invalid-id';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(locationService.findSelectedLocation'(id)).rejects.toThrow(
        BadRequestException,
      );

      // restoring the original behavior of isValidObjectId after the test
      isValidObjectIdMock.mockRestore();
    });
  });

  describe('createLocation', () => {
    it('should create and return created Location', async () => {
      const newLocationDto: CreateLocationDto = {
        name: 'Meeting Room',
        meetingRoom: false,
      };

      jest
        .spyOn(locationModel, 'create')
        .mockImplementationOnce(
          () => Promise.resolve(mockCreateLocation) as any,
        );
      const newLocation = await locationService.create(
        newLocationDto as CreateLocationDto,
      );

      expect(newLocation).toEqual(mockCreateLocation);
    });
  });

  describe('uploadGallery', () => {
    const galleryDto: UploadGalleryDto = {
      public: true,
    };

    const fileBuffer = Buffer.from('file-content');
    const fileName = 'image.jpg';
    const folderName = 'locationGallery';

    const params: any = {
      Bucket: process.env.S3_UMBARTHA_BUCKET_NAME,
      Key: `${folderName}/${mockLocation._id}${Date.now()}-${fileName}`,
      Body: fileBuffer,
    };

    it('should add new Gallery object to Location and return updated Location', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(mediaService, 'upload').mockResolvedValue(params as any);

      jest.spyOn(locationModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockGalleryUpdateLocation),
      } as any);

      const updatedLocation = await locationService.addGalleryForLocation(
        mockLocation._id,
        galleryDto,
        fileBuffer,
        fileName,
      );

      expect(updatedLocation).toEqual(mockGalleryUpdateLocation);
    });
  });

  describe('removeGallery', () => {
    it('should remove a gallery and return updated location', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockCreateLocation),
      } as any);

      const updatedLocation = await locationService.removeGalleryFromLocation(
        mockGalleryUpdateLocation._id,
        mockGalleryUpdateLocation.gallery[0]._id,
      );

      expect(updatedLocation).toEqual(mockCreateLocation);
    });

    it('should throw NotFoundException if Location is not found', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        locationService.removeGalleryFromLocation(
          mockGalleryUpdateLocation._id,
          '64df46647bd7682a77fd09bc',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if invalid Location ID is given', async () => {
      const isValidLocationObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);

      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      const id = 'invalid-id';
      const isValidGalleryObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        locationService.removeGalleryFromLocation(mockGalleryUpdateLocation._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidGalleryObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidLocationObjectIdMock.mockRestore();
    });
  });

  describe('addClosedDatePlanToLocation', () => {
    const closedDatePlanDto: CreateClosedDatePlaneDto = {
      type: Type.DAY,
      valueFrom: 'xxxx',
      valueTo: 'xxxx',
    };

    it('should add Closed Date Plan to Location', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);
      const updatedLocation = await locationService.addClosedDatePlaneForLocation(
        mockLocation._id,
        closedDatePlanDto as CreateClosedDatePlaneDto,
      );

      expect(updatedLocation).toEqual(mockLocation);
    });
  });

  describe('removeClosedDatePlanToLocation', () => {
    it('should remove ClosedDatePlan from Lcation and return updated Location', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockGalleryUpdateLocation),
      } as any);
      const updatedLocation = await locationService.removeClosedDatePlan(
        mockLocation._id,
        '64df46697bd7682a77fd09bf',
      );

      expect(updatedLocation).toEqual(mockGalleryUpdateLocation);
    });

    it('should throw NotFoundException if ClosedDatePlane is not found', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findOneAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(
        locationService.removeClosedDatePlan(
          mockLocation._id,
          '64df46697bd7682a77fd09bf',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid ClosedDatePlan ObjectId', async () => {
      const isValidLocationObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValueOnce(true);
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      const id = 'invalid-id';
      const isValidClosedDatePlanObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(
        locationService.removeClosedDatePlan(mockLocation._id, id),
      ).rejects.toThrow(BadRequestException);

      // restoring the original behavior of isValidObjectId after the test
      isValidClosedDatePlanObjectIdMock.mockRestore();
      // restoring the original behavior of isValidObjectId after the test
      isValidLocationObjectIdMock.mockRestore();
    });
  });

  describe('updateLocation', () => {
    const updateLocationDto: UpdateLocationDto = {
      name: 'Main Room',
    };

    it('should update and return updated Location given ID', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockLocation),
      } as any);

      jest.spyOn(locationModel, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...updateLocationDto,
          meetingRoom: false,
          _id: '64df0f75d007e58ada2a0291',
          gallery: [],
          closedDatePlan: [],
        }),
      } as any);
      const updatedLocation = await locationService.updateLocation(
        mockCreateLocation._id,
        updateLocationDto as UpdateLocationDto,
      );

      expect(updatedLocation).toEqual(mockUpdateLocation);
    });
  });

  describe('removeService', () => {
    it('should remove and return service given ID', async () => {
      jest.spyOn(locationModel, 'findById').mockReturnValue({
        exec: jest.fn().mockReturnValue({
          deleteOne: jest.fn().mockResolvedValueOnce(mockLocation),
        }),
      } as any);
      const deletedLocation = await locationService.removeLocation(mockLocation._id);

      expect(deletedLocation).toEqual(mockLocation);
    });
  });
});
