import { CACHE_MANAGER, Controller, Get, Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {

  private readonly logger = new Logger(AppService.name);
  public cacheEnabled: boolean = false; //TODO: set to true before shipping
  private ttlCache: number = 1000 * 60 * 60; // 1 hour caching time  
  private keyCache: string = 'flights';

  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
  ) {}
              
  @Get()    
  async getFlights(): Promise<any> {        
    
    try {       
      // return cached response if available
      if (this.cacheEnabled) {
        let cachedResponse = await this.cacheManager.get(this.keyCache);        
        if (cachedResponse) {
          this.logger.log("Cached response sent.");
          return cachedResponse;
        }
      }
      
      // return flight sources data
      let response = await this.appService.getFlights();     
      if (this.cacheEnabled) {
        await this.cacheManager.set(this.keyCache, response, this.ttlCache);
      }
      this.logger.log("Response sent.");
      return response;                                           
    }
    catch(error) {
      throw new InternalServerErrorException(error.message);
    }              
  }
}
