import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, catchError, map, forkJoin, Observable, timer, mapTo, of } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class AppService {
  
  private readonly logger = new Logger(AppService.name);
  
  // Array for storing the flight sources URLS, add more in case of need
  private flightSources: string[] = [
    'https://coding-challenge.powerus.de/flight/source1', 
    'https://coding-challenge.powerus.de/flight/source2'
  ];

  constructor(private readonly httpService: HttpService) { }

  private mergeResponses(data: any[]): any[] {
    let mergedResponse: object[] = [];
    
    for (let response of data) {
      if (response !== null) {
        mergedResponse = mergedResponse.concat(response['flights']);
      }
    }

    return mergedResponse;
  }

  private createId(flight: any): string {
    let departureTs = new Date(flight['departure_date_time_utc']).getTime();    
    return `${flight['flight_number']}${departureTs}`;    
  }

  private addIdentifiers(data: any[]): any[] {
    return data.map(flight => {
      flight['slices'] = flight['slices'].map(flight => ({id: this.createId(flight), ...flight}));
      return flight;
    });
  }

  private removeDuplicates(data: any[]): any[] {
    let composedIds: string[] = [];
    
    return data.filter(flight => { 
      let composedId: string = `${flight['slices'][0].id}${flight['slices'][1].id}`;
      if (!composedIds.includes(composedId)) {
        composedIds.push(composedId);            
        return true;
      } else {                
        return false;
      }
    });    
  }

  private removeNulls(data: any[]): any[] {
    return data.filter(response => response !== null);
  }

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
        next: responseData => { 
          // if all requests fail return an error
          if (responseData.every(response => response === null)) {
            reject("No flight sources available at the moment.");          
          } else { // process response data
            let processedData: object[] = [];
            
            processedData = this.removeNulls(responseData);
            processedData = this.mergeResponses(processedData);
            processedData = this.addIdentifiers(processedData);
            processedData = this.removeDuplicates(processedData);  

            resolve(processedData);
          }          
        }, 
        error: (error) => reject(error),
      })             
    });                
  }  
}
