import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as console from "console";
import {PORT} from "./core/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}
bootstrap();
