import { Module } from '@nestjs/common';
import { AmoApiService } from "./amo.service";
import { AmoApiRepository } from "./amo.repository";

@Module({
    providers: [AmoApiService, AmoApiRepository],
    exports: [AmoApiService]
})
export class AmoApiModule {}
