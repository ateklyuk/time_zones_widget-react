import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {DB_NAME, DB_URI} from "../core/consts/consts";
import {AccountModule} from "../modules/account/account.module";
import {AmoApiModule} from "../modules/amo-api/amo.module";
import {TimezonesModule} from "../modules/timezones/timezones.module";
import {LoggerService} from "../core/logger/logger.service";

@Module({
  controllers: [AppController],
  providers: [AppService, LoggerService],
  imports: [
      MongooseModule.forRoot(DB_URI, {
          dbName: DB_NAME
      }),
      AccountModule,
      AmoApiModule,
      TimezonesModule
  ]
})
export class AppModule {}
