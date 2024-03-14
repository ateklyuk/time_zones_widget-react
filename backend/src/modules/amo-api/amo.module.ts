import { Module } from '@nestjs/common';
import {AmoService} from "./amo.service";
import {AmoRepository} from "./amo.repository";

@Module({
    providers: [AmoService, AmoRepository]
})
export class AccountModule {}
