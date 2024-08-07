import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthy')
  healthCheck() {
    return HttpStatus.OK;
  }
}
