import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, catchError, map, forkJoin, Observable, timer, mapTo, of } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  
  private readonly logger = new Logger(AppService.name);
  
  private flightSources: string[] = [
    'https://coding-challenge.powerus.de/flight/source1', 
    'https://coding-challenge.powerus.de/flight/source2'
  ];

  constructor(private readonly httpService: HttpService) { }

  async getFlights(): Promise<object> {
          
    let createRequest = (sourceUrl =>
      this.httpService.get<object[]>(sourceUrl).
        pipe(
          map(response => response.data),
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);                        
            return of(null);
          }),
        )
    );

    let requests = this.flightSources.map(source => createRequest(source));

    return new Promise((resolve, reject) => {     
      forkJoin(requests).
      subscribe({
        next: requestResponse => { 
          // if all requests fail return an error
          if (requestResponse.every(response => response === null)) {
            reject("No flight source available");
          } else {
            resolve(requestResponse);
          }          
        }, 
        error: (error) => reject(error),
      })             
    });                
  }  
}
