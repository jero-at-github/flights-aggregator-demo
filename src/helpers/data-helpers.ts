import { Flights, Slice } from "src/flights/flights.interface";

export class DataHelper {
    
  private static mergeResponses(data: Flights[]): Flights {
    let mergedResponse: Flights = { flights: []};
    
    for (let response of data) {
      if (response !== null) {
        mergedResponse.flights = mergedResponse.flights.concat(response.flights );
      }
    }

    return mergedResponse;
  }

  private static createId(data: Slice): string {
    // generate an id using the flight number and the departure date
    let departureTs = new Date(data.departure_date_time_utc).getTime();    
    return `${data.flight_number}${departureTs}`;    
  }

  private static addIdentifiers(data: Flights): Flights {
    data.flights = data.flights.map(flight => {
      flight.slices = flight.slices.map(flight => ({id: this.createId(flight), ...flight}));
      return flight;
    });

    return data;
  }

  private static removeDuplicates(data: Flights): Flights {
    let composedIds: string[] = [];
    
    data.flights = data.flights.filter(flight => { 
      // create a composed id using both flights of a slice
      let composedId: string = `${flight.slices[0].id}${flight.slices[1].id}`;
      if (!composedIds.includes(composedId)) {
        composedIds.push(composedId);            
        return true;
      } else {                
        return false;
      }
    });    

    return data;
  } 

  public static processResponse(responseData: Flights[]): Flights {    
    let processedData: Flights = null;
                
    processedData = this.mergeResponses(responseData);
    processedData = this.addIdentifiers(processedData);
    processedData = this.removeDuplicates(processedData);  

    return processedData;
  }
}