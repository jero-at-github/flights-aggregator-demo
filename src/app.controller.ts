import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get()
  async getFlights(): Promise<any> {
    
    return this.appService.
      getFlights().      
      catch((error) => {        
        throw new InternalServerErrorException(error.message);
      });      
  }
}
