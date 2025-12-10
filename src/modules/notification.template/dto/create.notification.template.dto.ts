import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { NotificationTemplateType } from '../schema/notification.template.schema';

export class CreateNotificationTemaplateDto {
  @IsNotEmpty()
  @IsEnum(NotificationTemplateType)
  readonly type: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;
}
