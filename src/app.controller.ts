import { CacheInterceptor, CacheKey, CacheTTL, CACHE_MANAGER, Controller, Get, Inject, InternalServerErrorException, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Cache } from 'cache-manager';

@Controller()
@UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache, 
  ) {}
    
  @Get()    
  async getFlights(): Promise<any> {
        
    try {            
      console.log("controller");
      let response = await this.appService.getFlights();     
      
      return response;                 
    } 
    catch(error) {
      throw new InternalServerErrorException(error.message);
    }              
  }
}
