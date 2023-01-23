import { Flight, Flights, Slice } from "src/flights/flights.interface";

export class DataHelper {
    
  private static mergeResponses(data: Flights[]): any[] {
    let mergedResponse: object[] = [];
    
    for (let response of data) {
      if (response !== null) {
        mergedResponse = mergedResponse.concat(response.flights);
      }
    }

    return mergedResponse;
  }

  private static createId(flight: Slice): string {
    // generate an id using the flight number and the departure date
    let departureTs = new Date(flight.departure_date_time_utc).getTime();    
    return `${flight.flight_number}${departureTs}`;    
  }

  private static addIdentifiers(data: Flight[]): Flight[] {
    return data.map(flight => {
      flight.slices = flight.slices.map(flight => ({id: this.createId(flight), ...flight}));
      return flight;
    });
  }

  private static removeDuplicates(data: Flight[]): Flight[] {
    let composedIds: string[] = [];
    
    return data.filter(flight => { 
      // create a composed id using both flights of a slice
      let composedId: string = `${flight.slices[0].id}${flight.slices[1].id}`;
      if (!composedIds.includes(composedId)) {
        composedIds.push(composedId);            
        return true;
      } else {                
        return false;
      }
    });    
  } 

  public static processResponse(responseData: Flights[]): any[] {    
    let processedData: any[] = [];
                
    processedData = this.mergeResponses(responseData);
    processedData = this.addIdentifiers(processedData);
    processedData = this.removeDuplicates(processedData);  

    return processedData;
  }
}