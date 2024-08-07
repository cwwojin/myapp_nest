import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthy')
  healthCheck() {
    return HttpStatus.OK;
  }
}
