import { PartialType } from '@nestjs/mapped-types';
import { CreateRateDto } from './create.counsellor.rate';

export class UpdateRateDto extends PartialType(CreateRateDto) {}
