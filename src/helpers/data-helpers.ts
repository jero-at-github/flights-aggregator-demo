import { isSameDay } from "date-fns";
import { Filters } from "src/app.controller";
import { Flights, Slice } from "src/models/flights.classes";

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
  
  public static filterResponse(processedResponse: Flights, filters: Filters): Flights {    

    if (Object.keys(filters).length !== 0) {    
      processedResponse.flights = processedResponse.flights.filter(flight => {
        let filterResult: boolean = true;
      
        if (filters.departureDate) {
          filterResult = filterResult && isSameDay(
            new Date(flight.slices[0].departure_date_time_utc), 
            new Date(filters.departureDate)
          );
        }
        if (filters.returnDate) {
          filterResult = filterResult && isSameDay(
            new Date(flight.slices[1].departure_date_time_utc), 
            new Date(filters.returnDate)
          );
        }
        if (filters.origin) {        
          let string1: string = flight.slices[0].origin_name.toLocaleLowerCase().trim();
          let string2: string = filters.origin.toLocaleLowerCase().trim();
          filterResult = filterResult && string1.includes(string2);
        }
        if (filters.destination) {                
          let string1: string = flight.slices[0].destination_name.toLocaleLowerCase().trim();
          let string2: string = filters.destination.toLocaleLowerCase().trim();
          filterResult = filterResult && string1.includes(string2);                        
        }
        if (filters.maxPrice) {        
          filterResult = filterResult && flight.price <= filters.maxPrice;
        }

        return filterResult;
      });   
    }
    
    return processedResponse;
  }

  public static processResponse(responseData: Flights[]): Flights {    
    let processedData: Flights = null;
                
    processedData = this.mergeResponses(responseData);
    processedData = this.addIdentifiers(processedData);
    processedData = this.removeDuplicates(processedData);  

    return processedData;
  }
}