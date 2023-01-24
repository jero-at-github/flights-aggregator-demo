import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Flights } from 'src/models/flights.interface';
import { isSameDay } from 'date-fns';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Make several requests to give a chance to cache data
    const maxIterations: number = 15;
    let iteration: number = 0;
    let isDataCached: boolean = false;

    // since we can get a combination of possible succes and error responses,
    // we try couple of times to get the chance to test the different cases
    while (iteration < maxIterations) {                
      let response = await request(app.getHttpServer()).get('/flights');              
      if (response.status == 200) {
        isDataCached = true;
      }      
      iteration ++;
    }    

    if (!isDataCached) {
      throw "It was not possiblet to cache any data";
    }    
  });

  it('(GET) /', async () => {        
    let response = await request(app.getHttpServer()).get('/flights');
      
    expect(response.status).toBe(200);    
    expect(response.body.flights.length).toBeGreaterThanOrEqual(5);
    expect(response.body.flights.length).toBeLessThanOrEqual(8);        
  });

  it('(GET) /?maxPrice=150', async () => {    
           
      let response = await request(app.getHttpServer()).get('/flights?maxPrice=150');              
      expect(response.status).toBe(200);
    
      let body: Flights = response.body;      
      expect(response.body.flights.length).toBeGreaterThanOrEqual(5);
      expect(response.body.flights.length).toBeLessThanOrEqual(8);
      expect(
        body.flights.every(flight => flight.price <= 150)
      ).toBeTruthy();                             
  });

  it('(GET) /?maxPrice=90', async () => {    
           
    let response = await request(app.getHttpServer()).get('/flights?maxPrice=90');              
    expect(response.status).toBe(200);
  
    let body: Flights = response.body;      
    expect(body.flights.length).toBe(0);    
  });

  it('(GET) /?maxPrice=150&origin=Schon', async () => {    
              
      let response = await request(app.getHttpServer()).get('/flights?maxPrice=150&origin=Schon');              
      expect(response.status).toBe(200);      
      
      let body: Flights = response.body;                
      expect(response.body.flights.length).toBeLessThanOrEqual(6);       
      expect(
        body.flights.every(flight => { 
          return flight.price <= 150 && flight.slices[0].origin_name.includes("Schon");
        })
      ).toBeTruthy();            
  });

  it('(GET) /?origin=Mallorca', async () => {    
           
    let response = await request(app.getHttpServer()).get('/flights?origin=Mallorca');              
    expect(response.status).toBe(200);
  
    let body: Flights = response.body;      
    expect(body.flights.length).toBe(0);    
  });

  it('(GET) /?destination=Malaga', async () => {    
           
    let response = await request(app.getHttpServer()).get('/flights?destination=Malaga');              
    expect(response.status).toBe(200);
  
    let body: Flights = response.body;      
    expect(body.flights.length).toBe(0);    
  });

  it('(GET) /?maxPrice=150&origin=Schon&destination=Stansted', async () => {    
              
    let response = await request(app.getHttpServer()).get('/flights?maxPrice=150&origin=Schon&destination=Stansted');              
    expect(response.status).toBe(200);      
    
    let body: Flights = response.body;                
    expect(response.body.flights.length).toBeLessThanOrEqual(6);       
    expect(
      body.flights.every(flight => { 
        return flight.price <= 150 && 
          flight.slices[0].origin_name.includes("Schon") && 
          flight.slices[0].destination_name.includes("Stansted");
      })
    ).toBeTruthy();            
  });  

  it('(GET) All filters', async () => {    
              
    let response = await request(app.getHttpServer()).get("/flights" +
      "?maxPrice=150" +
      "&origin=Schon" +
      "&destination=Stansted" +
      "&departureDate=2019-08-08T04:30:00.000Z" +
      "&returnDate=2019-08-10T06:25:00.000Z");
    expect(response.status).toBe(200);      
    
    let body: Flights = response.body;                
    expect(response.body.flights.length).toBeLessThanOrEqual(6);       
    expect(
      body.flights.every(flight => { 
        return flight.price <= 150 && 
          flight.slices[0].origin_name.includes("Schon") && 
          flight.slices[0].destination_name.includes("Stansted") &&
          isSameDay(
            new Date(flight.slices[0].departure_date_time_utc), 
            new Date("2019-08-08T04:30:00.000Z")
          ) &&    
          isSameDay(
            new Date(flight.slices[1].departure_date_time_utc), 
            new Date("2019-08-10T04:30:00.000Z")
          );
      })
    ).toBeTruthy();            
  });

  it('(GET) /?departureDate=2019-08-08T04:30:00.000Z', async () => {    
           
    let response = await request(app.getHttpServer()).get('/flights?departureDate=2019-08-07T04:30:00.000Z');              
    expect(response.status).toBe(200);
  
    let body: Flights = response.body;      
    expect(body.flights.length).toBe(0);    
  });

  it('(GET) /?returnDate=2019-08-08T04:30:00.000Z', async () => {    
           
    let response = await request(app.getHttpServer()).get('/flights?returnDate=2019-08-11T04:30:00.000Z');              
    expect(response.status).toBe(200);
  
    let body: Flights = response.body;      
    expect(body.flights.length).toBe(0);    
  });
});
