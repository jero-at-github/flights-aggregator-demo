import { Controller, Get, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Flights } from './models/flights.interface';

export type Filters = {
  departureDate?: string,
  returnDate?: string,  
  origin?: string;
  destination?: string;
  maxPrice?: number;
};

@Controller('flights')
export class AppController {

  private readonly logger = new Logger(AppService.name); 

  constructor(
    private readonly appService: AppService,     
  ) {}
        
  public useCache(isCacheOn: boolean): void {
    this.appService.cacheEnabled = isCacheOn;
  }

  @Get()    
  async getFlights(
    @Query('departureDate') departureDate: string,
    @Query('returnDate') returnDate: string,
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('maxPrice') maxPrice: number,
  ): Promise<Flights> {            
    try { 
      this.logger.log("Flights requested");  
      
      // Collect filters
      let filters: Filters = { };                    
      if (departureDate) {
        filters.departureDate = departureDate;
      }
      if (returnDate) {
        filters.returnDate = returnDate;          
      }
      if (origin) {
          filters.origin = origin;                
      }        
      if (destination) {
        filters.destination = destination;                
      }        
      if (maxPrice) {
        filters.maxPrice = Number(maxPrice);
      }        
                    
      // Fetch source data
      let response = await this.appService.getFlights(filters);                 
      this.logger.debug(`Response contains ${response.flights.length} flights`);      
      
      // Response      
      return response;                                           
    }
    catch(error) {
      throw new InternalServerErrorException(error);
    }              
  }
}
