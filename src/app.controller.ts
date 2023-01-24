import { Controller, Get, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
@ApiTags('flights')
export class AppController {

  private readonly logger = new Logger(AppService.name); 

  constructor(
    private readonly appService: AppService,     
  ) {}
        
  public useCache(isCacheOn: boolean): void {
    this.appService.cacheEnabled = isCacheOn;
  }

  @Get()  
  @ApiOperation({ summary: 'Get flights from different sources and cache the response' })  
  @ApiOkResponse({ description: 'Flights retrieved successfully.'})
  @ApiInternalServerErrorResponse({ description: 'No flight sources available at the moment.'})
  @ApiQuery({ name: "departureDate", type: Date, description: "Departure date. Optional", required: false })
  @ApiQuery({ name: "returnDate", type: Date, description: "Return date. Optional", required: false })
  @ApiQuery({ name: "origin", type: String, description: "Origin. Optional", required: false })
  @ApiQuery({ name: "destination", type: String, description: "Destination. Optional", required: false })
  @ApiQuery({ name: "maxPrice", type: String, description: "Max price. Optional", required: false })
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
