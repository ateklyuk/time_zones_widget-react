import { Module } from '@nestjs/common';
import { TimezonesService } from './timezones.service';
import { TimezonesController } from './timezones.controller';
import {TimezonesRepository} from "./timezones.repository";

@Module({
  providers: [TimezonesService, TimezonesRepository],
  controllers: [TimezonesController]
})
export class TimezonesModule {}
