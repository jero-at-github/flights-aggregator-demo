import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, CACHE_MANAGER, Inject } from '@nestjs/common';
import { catchError, map, forkJoin, of, Observable, retry, timeout } from 'rxjs';
import { AxiosError } from 'axios';
import {  Flights } from './flights/flights.interface';
import { Cache } from 'cache-manager';
import { DataHelper } from './helpers/data-helpers';

@Injectable()
export class AppService {
  
  private readonly logger = new Logger(AppService.name);  
  
  public cacheEnabled: boolean = true; //TODO: set to true before shipping
  // private ttlCache: number = 1000 * 60 * 60; // 1 hour caching time    
  private ttlCache: number = 1000 * 5; // 1 hour caching time    
  
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

  async createRequest(sourceUrl) {
    
    // returns the cached response if available
    if (this.cacheEnabled) {
      let cachedResponse = await this.cacheManager.get<Flights>(sourceUrl);        
      if (cachedResponse) {
        this.logger.debug(`Using cached response for ${sourceUrl}.`);
        return of(cachedResponse);
      }
    } 
   
    // creates an observable to fetch a http request    
    return this.httpService.get<Flights>(sourceUrl).
      pipe(
        map(response => {             
          // cache response data 
          if (this.cacheEnabled) {
            this.logger.debug(`Caching response for ${sourceUrl}.`);
            this.cacheManager.set(sourceUrl, response.data, this.ttlCache);
          }            
          return response.data; 
        }),           
        retry(),
        timeout(this.requestTimeLimit),        
        catchError((error: AxiosError) => {          
          this.logger.error(error, `URL: ${sourceUrl}`);
          return of(null);
        }),
      );          
  }

  /**
   * Fetch all the flights from the different sources and process the data   
   * @returns The list of flights to be consumed.
   */
  async getFlights(): Promise<any> {
                    
    // creates and array with all the requests and a time limit observables    
    let requests: Observable<Flights>[] = await Promise.all(
      this.flightSources.map(source => this.createRequest(source))
    );    

    // fetch data and process it
    return new Promise((resolve, reject) => {           
      forkJoin(requests).
      subscribe({
        next: responseData => { 
          // if none request returns data, throw an error
          responseData = responseData.filter(response => response !== null);
          if (responseData.length == 0) {
            reject(new Error("No flight sources available at the moment"));          
          } else {             
            resolve(DataHelper.processResponse(responseData));            
          }          
        }, 
        error: (error) => reject(error),
      })             
    });                
  }  
}
