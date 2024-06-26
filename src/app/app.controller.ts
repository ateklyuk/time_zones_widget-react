import {Controller, Get} from '@nestjs/common';
import {LoggerService} from "../core/logger/logger.service";
import {PORT} from "../core/consts/consts";
import {Endpoints} from "../core/consts/endpoints";

@Controller()
export class AppController {
    constructor(private readonly loggerService: LoggerService) {}
    @Get(Endpoints.Runtime.Ping)
    public ping(): string {
        this.loggerService.debug(
            `server is working on port: ${PORT}`,
        );
        return `SERVER IS WORKING ON PORT: ${PORT} `;
    }
}