import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as console from "console";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000, () => console.log("start"));
}
bootstrap();
