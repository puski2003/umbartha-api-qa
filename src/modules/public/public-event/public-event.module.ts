import { Module } from '@nestjs/common';
import { PublicEventController } from './public-event.controller';
import { PublicEventService } from './public-event.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/modules/event/schema/event.schema';
import { EventModule } from 'src/modules/event/event.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    EventModule,
  ],
  controllers: [PublicEventController],
  providers: [PublicEventService],
})
export class PublicEventModule {}
