import { Module } from '@nestjs/common';
import { PublicContactService } from './public-contact.service';
import { PublicContactController } from './public-contact.controller';
import { ContactModule } from 'src/modules/contact/contact.module';

@Module({
  imports: [ContactModule],
  providers: [PublicContactService],
  controllers: [PublicContactController],
})
export class PublicContactModule {}
