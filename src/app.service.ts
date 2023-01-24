import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, CACHE_MANAGER, Inject } from '@nestjs/common';
import { catchError, map, forkJoin, of, Observable, retry, timeout } from 'rxjs';
import { AxiosError } from 'axios';
import { Flights } from './models/flights.classes';
import { Cache } from 'cache-manager';
import { DataHelper } from './helpers/data-helpers';
import { NO_RESPONSE_DATA_MSG } from './helpers/error-messages';
import { Filters } from './app.controller';

interface FlightsResponse {
  sourceUrl: string;
  data: Flights;
  isCached: boolean;
}

export const ttlCache: number = 1000 * 60 * 60; // 1 hour caching time      

@Injectable()
export class AppService {
  
  private readonly logger = new Logger(AppService.name);  
  
  public cacheEnabled: boolean = true;  
  
  // Time limit for fetching all the flight sources
  private requestTimeLimit: number = 900;

  // Array for storing the flight sources URLS, add more in case of need
  private flightSources: string[] = [
    'https://coding-challenge.powerus.de/flight/source1', 
    'https://coding-challenge.powerus.de/flight/source2'    
  ];

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  
  /**
   * Creates observables for each data source.
   * @param sourceUrl URL of the data source.
   * @returns Either an httpService or a data cached observable.
   */
  async createSourceObs(sourceUrl): Promise<Observable<FlightsResponse>> {
    
    // returns and observable with the cached response if available
    if (this.cacheEnabled) {
     let cachedResponse = await this.cacheManager.get<Flights>(sourceUrl);             
      if (cachedResponse) {        
        this.logger.debug(`Using cached response for ${sourceUrl}.`);        
        let flightsReponse: FlightsResponse = {
          sourceUrl,
          data: cachedResponse,
          isCached: true,
        };        
        return of(flightsReponse);
      }
    } 
   
    // creates an observable to fetch a http request    
    return this.httpService.get<Flights>(sourceUrl).
      pipe(
        map(response => {                         
          let flightsReponse: FlightsResponse = {
            sourceUrl,
            data: response.data,
            isCached: false,
          };        
          return flightsReponse; 
        }),           
        retry(),
        timeout(this.requestTimeLimit),        
        catchError((error: AxiosError) => {          
          this.logger.error(error, `URL: ${sourceUrl}`);          
          return of(null);
        }),
      );          
  }

  private async cacheResponses(flightsResponse: FlightsResponse[]) {      
    let responsesToCache = flightsResponse.filter(response => !response.isCached);
    await Promise.all(
      responsesToCache.map(response=> {
        this.logger.debug(`Caching response for ${response.sourceUrl}.`);
        return this.cacheManager.set(response.sourceUrl, response.data, ttlCache);
      })
    );           
  }
  
  /**
   * Fetch all the flights from the different sources, uses cache if applicable and process the data .  
   * @returns The list of flights to be consumed.
   */
  async getFlights(filters: Filters): Promise<Flights> {
                    
    // creates and array with all the source observables
    let sources$: Observable<FlightsResponse>[] = await Promise.all(
      this.flightSources.map(source => this.createSourceObs(source))
    );    

    // fetch data and process it
    return new Promise((resolve, reject) => {           
      forkJoin(sources$).
      subscribe({
        next: async flightsResponse => {           
          // clean response of nulls (requests which didn't return any data because error)
          flightsResponse = flightsResponse.filter(response => response !== null);

          // if none request returns data, throw an error          
          if (flightsResponse.length == 0) {
            reject(new Error(NO_RESPONSE_DATA_MSG));          
          } else {                 
            // cache response data 
            if (this.cacheEnabled) {
              await this.cacheResponses(flightsResponse);
            }

            // Merge, add identifiers and remove duplicates
            let processedResponse: Flights = DataHelper.processResponse(
              flightsResponse.map(response => response.data)
            );

            // Filter
            processedResponse = DataHelper.filterResponse(processedResponse, filters);
            
            // resolve
            resolve(processedResponse);
          }          
        }, 
        error: (error) => reject(error),
      })             
    });                
  }  
}
