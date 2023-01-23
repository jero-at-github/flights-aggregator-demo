import { Controller, Get, InternalServerErrorException, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppService.name); 

  constructor(
    private readonly appService: AppService,     
  ) {}
        
  public useCache(isCacheOn: boolean): void {
    this.appService.cacheEnabled = isCacheOn;
  }

  @Get('flights')    
  async getFlights(): Promise<any> {            
    try {                   
      this.logger.log("Flights requested");      
      let response = await this.appService.getFlights();                 
      this.logger.debug(`Response contains ${response.length} flights`);
      
      return response;                                           
    }
    catch(error) {
      throw new InternalServerErrorException(error.message);
    }              
  }
}
