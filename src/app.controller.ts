import { Controller, Get, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get()
  async getFlights(): Promise<object> {
    
    return this.appService.getFlights().catch((error) => {
      throw new InternalServerErrorException(error);
    });      
  }
}
